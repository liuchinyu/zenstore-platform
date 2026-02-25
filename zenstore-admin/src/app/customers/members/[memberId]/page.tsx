"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { useToast } from "@/components/ui/Toast";
import { MemberFormData, Order } from "@/types/customers/member";
import { format } from "date-fns";
import {
  OrderStatusTransform,
  PaymentStatusTransform,
  ShippingStatusTransform,
} from "@/utils/OrderStatusTransform";
import {
  useGetMemberByIdQuery,
  useUpdateMemberMutation,
  useSendResetPasswordEmailMutation,
} from "@/store/api/memberApi";
import memberService from "@/services/memberService";
import BlockMemberModal from "@/components/BlockMemberModal/BlockMemberModal";
import GroupMembersModal from "@/components/GroupMembersModal/GroupMembersModal";
import { SendMessageModal } from "@/components/SendMessageModal";
import { useMemberGroups } from "@/hooks/useMemberGroups";
import Link from "next/link";
import SendResetPasswordEmailModal from "@/components/SendResetPasswordEmailModal/SendResetPasswordEmailModal";

const MemberDetail = () => {
  const { memberId } = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  // 使用 custom hook 處理會員群組
  const {
    groups: groupsList,
    showMemberGroupModal,
    selectedGroup,
    memberGroupName,
    setMemberGroupName,
    handleSelectGroup,
    handleApplyGroup,
    handleOpenGroupModal,
    handleCloseGroupModal,
  } = useMemberGroups(typeof memberId === "string" ? memberId : undefined);

  // RTK Query hooks
  const {
    data: memberData,
    isLoading: isMemberLoading,
    isFetching,
  } = useGetMemberByIdQuery(typeof memberId === "string" ? memberId : "", {
    skip: typeof memberId !== "string",
  });

  console.log("memberData", memberData);

  const [updateMember] = useUpdateMemberMutation();
  const [sendResetPasswordEmail] = useSendResetPasswordEmailMutation();

  // Component States
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalSpent, setTotalSpent] = useState(0); //不是表單欄位
  const [orderCount, setOrderCount] = useState(0); //不是表單欄位
  const [userName, setUserName] = useState("");
  const [originalData, setOriginalData] = useState<MemberFormData | null>(null);
  const [isBlock, setIsblock] = useState(0); //動態呈現是停權 or 正常

  // 添加手動追蹤變更的欄位
  const [manuallyChangedFields, setManuallyChangedFields] = useState<
    Record<string, boolean>
  >({});
  // blockModal設定
  const [modalOperation, setModalOperation] = useState<"block" | "unblock">(
    "block",
  );
  const [showBlockMemberModal, setShowBlockMemberModal] =
    useState<boolean>(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showSendMessageModal, setShowSendMessageModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    setValue,
    getValues,
    reset,
    watch,
  } = useForm<MemberFormData>({});

  // 使用 watch 監視需要在頁面頂部顯示的欄位
  const registerDate = watch("register_date");
  const lastLoginTime = watch("last_login_time");
  const loginIp = watch("login_ip");

  // 當 memberData 更新時設置表單
  useEffect(() => {
    if (memberData) {
      const { member, orders } = memberData;

      if (member && member.length > 0) {
        const memberInfo = member[0];
        // 使用 setValue 逐一設置欄位值
        setValue("member_type", memberInfo.MEMBER_TYPE);
        setValue("user_name", memberInfo.USER_NAME || "");
        setUserName(memberInfo.USER_NAME);
        setValue("mobile_phone", memberInfo.MOBILE_PHONE || "");
        setValue("email", memberInfo.EMAIL || "");
        setValue(
          "address",
          (memberInfo.REGION || "") +
            (memberInfo.CITY || "") +
            (memberInfo.ADDRESS || ""),
        );
        setValue("gender", memberInfo.GENDER || "");
        setValue("phone", memberInfo.PHONE || "");
        setValue(
          "birthday",
          memberInfo.BIRTHDAY
            ? format(new Date(memberInfo.BIRTHDAY), "yyyy-MM-dd")
            : "",
        );
        setValue("register_date", memberInfo.CREATED_AT);
        setValue("last_login_time", memberInfo.LAST_LOGIN_AT);
        setIsblock(memberInfo.IS_BLOCKLIST);
        setTotalSpent(memberInfo.TOTAL_AMOUNT || 0);
        setOrderCount(memberInfo.ORDER_COUNT || 0);
        setMemberGroupName(memberInfo.GROUP_NAME || "");
        setValue("industry_type", memberInfo.INDUSTRY_TYPE || "無");
        setValue("company_name", memberInfo.COMPANY_NAME || "");
        setValue("tax_id", memberInfo.TAX_ID || "");
        setValue("notes", memberInfo.NOTES || "");

        // 在設置完所有表單值後，保存一份原始資料
        const initialFormValues = getValues();
        setOriginalData(initialFormValues);

        // 重置 dirtyFields
        reset(initialFormValues);
      }

      if (orders && orders.length > 0) {
        const processedOrders: Order[] = orders.map((o: any) => ({
          order_id: o.ORDER_ID,
          order_date: format(new Date(o.ORDER_DATE), "yyyy-MM-dd"),
          order_status: o.ORDER_STATUS,
          payment_status: o.PAYMENT_STATUS,
          shipping_status: o.SHIPPING_STATUS,
          total: o.TOTAL,
        }));
        setOrders(processedOrders);
      }
    }
  }, [memberData, setValue, reset, getValues, setMemberGroupName]);

  const getChangedData = (data: MemberFormData) => {
    if (!originalData) return data;

    // 基本識別欄位
    const changes: any = {};

    // 合併 dirtyFields 和手動追蹤的欄位
    const allChangedFields: Record<string, boolean> = {
      ...Object.entries(dirtyFields as Record<string, any>)
        .filter(([_, value]) => value === true)
        .reduce((acc, [key]) => ({ ...acc, [key]: true }), {}),
    };

    // 處理一般欄位
    Object.keys(allChangedFields).forEach((fieldName) => {
      // 確保欄位存在於data對象中
      if (fieldName in data) {
        // 將欄位添加到變更列表
        changes[fieldName] = data[fieldName as keyof MemberFormData];
        console.log(`添加變更: ${fieldName}`);
      }
    });

    return changes;
  };

  const handleBlockMembers = () => {
    setModalOperation("block");
    setShowBlockMemberModal(true);
  };

  const handleUnblockMembers = () => {
    setModalOperation("unblock");
    setShowBlockMemberModal(true);
  };

  const handleResetPasswordClick = () => {
    setShowResetPasswordModal(true);
  };

  const handleSendResetPasswordEmail = async (
    email: string,
    mobilePhone: string,
  ) => {
    try {
      const response = await sendResetPasswordEmail({
        email,
        mobilePhone,
      }).unwrap();
      if (response && response.success) {
        showToast({
          type: "success",
          title: "發送成功",
          message: "密碼重設信件已發送",
        });
      }
    } catch (error: any) {
      showToast({
        type: "error",
        title: "發送失敗",
        message: error.message || "發送密碼重設信件時發生錯誤",
      });
    }
  };

  const handleSendMessageClick = () => {
    setShowSendMessageModal(true);
  };

  const handleSendMessage = async (message: string) => {
    if (typeof memberId !== "string") return;

    try {
      const response = await memberService.sendInstantMessage(
        memberId,
        getValues("email"),
        userName,
        message,
      );
      if (response.success) {
        showToast({
          type: "success",
          title: "發送成功",
          message: "訊息已成功發送給使用者",
        });
        setShowSendMessageModal(false);
      } else {
        throw new Error(response.message || "後端處理失敗");
      }
    } catch (error: any) {
      showToast({
        type: "error",
        title: "發送失敗",
        message:
          error.response?.data?.message || error.message || "無法發送訊息",
      });
    }
  };

  const onSubmit: SubmitHandler<MemberFormData> = async (data) => {
    const changedData = getChangedData(data);
    if (Object.keys(changedData).length === 0) {
      showToast({
        type: "info",
        title: "無變更",
        message: "資料未被修改",
      });
      return;
    }

    try {
      if (typeof memberId !== "string") throw new Error("無效的會員ID");

      const response = await updateMember({
        member_id: memberId,
        data: changedData,
      }).unwrap();

      if (response && response.success) {
        showToast({
          type: "success",
          title: "更新成功",
          message: "會員資料已成功更新",
        });

        const currentValues = getValues();
        setOriginalData(currentValues);
        setManuallyChangedFields({});
        reset(currentValues);

        router.refresh();
      } else {
        throw new Error(response?.message || "更新失敗");
      }
    } catch (error: any) {
      showToast({
        type: "error",
        title: "更新失敗",
        message: error.message || "更新會員資料時發生錯誤",
      });
    }
  };

  if (isMemberLoading || (isFetching && !memberData)) {
    return <div>讀取中...</div>;
  }

  return (
    <div className="container-fluid p-4">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <h4 className="mb-0">
              {userName}{" "}
              <small className="text-muted" style={{ fontSize: "1rem" }}>
                註冊日期: {registerDate}
              </small>
            </h4>
          </div>
          <button type="submit" className="btn btn-primary">
            儲存變更
          </button>
        </div>
        {/* 操作按鈕 */}
        <div className="row mb-2">
          <div className="col">
            <div>
              <button
                type="button"
                className="btn btn-outline-secondary me-2"
                onClick={handleResetPasswordClick}
              >
                修改密碼
              </button>
              {isBlock === 0 ? (
                <button
                  type="button"
                  className="btn btn-danger me-2"
                  onClick={handleBlockMembers}
                >
                  停權
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-success me-2"
                  onClick={handleUnblockMembers}
                >
                  解封
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSendMessageClick}
              >
                <i className="bi bi-send me-2"></i>發送即時訊息
              </button>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-8">
            {/* 基本資訊卡片 */}
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">基本資訊</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">會員身份</label>
                    <input
                      type="text"
                      className="form-control"
                      {...register("member_type")}
                      disabled
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">姓名</label>
                    <input
                      type="text"
                      className="form-control"
                      {...register("user_name")}
                      onChange={(e) => {
                        register("user_name").onChange(e);
                      }}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">電子信箱</label>
                    <input
                      type="email"
                      className="form-control"
                      {...register("email")}
                      disabled
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">性別</label>
                    <select
                      className="form-select"
                      {...register("gender")}
                      onChange={(e) => {
                        register("gender").onChange(e);
                      }}
                    >
                      <option value="女">女</option>
                      <option value="男">男</option>
                      <option value="其他">其他</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">生日</label>
                    <input
                      type="date"
                      className="form-control"
                      {...register("birthday")}
                      onChange={(e) => {
                        register("birthday").onChange(e);
                      }}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">行動電話</label>
                    <input
                      type="text"
                      className="form-control"
                      {...register("mobile_phone")}
                      onChange={(e) => {
                        register("mobile_phone").onChange(e);
                      }}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">市內電話</label>
                    <input
                      type="text"
                      className="form-control"
                      {...register("phone")}
                      onChange={(e) => {
                        register("phone").onChange(e);
                      }}
                    />
                  </div>
                  {getValues("member_type") === "企業會員" && (
                    <>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">公司抬頭</label>
                        <input
                          type="text"
                          className="form-control"
                          {...register("company_name")}
                          onChange={(e) => {
                            register("company_name").onChange(e);
                          }}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">統一編號</label>
                        <input
                          type="text"
                          className="form-control"
                          {...register("tax_id")}
                          onChange={(e) => {
                            register("tax_id").onChange(e);
                          }}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">公司行業別</label>
                        <input
                          type="text"
                          className="form-control"
                          {...register("industry_type")}
                          onChange={(e) => {
                            register("industry_type").onChange(e);
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">訂購紀錄</h5>
                <div>
                  <button type="button" className="btn btn-primary">
                    <Link href="/orders" className="text-white">
                      查看所有訂單
                    </Link>
                  </button>
                </div>
              </div>
              <div className="card-body">
                <table className="table">
                  <thead>
                    <tr>
                      <th>訂單編號</th>
                      <th>訂單日期</th>
                      <th>訂單狀態</th>
                      <th>付款狀態</th>
                      <th>出貨狀態</th>
                      <th>訂單金額</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.order_id}>
                        <td>
                          <Link
                            href={`/orders/${order.order_id}`}
                            className="linkItem"
                          >
                            {order.order_id}
                          </Link>
                        </td>
                        <td>{order.order_date}</td>
                        <td>{OrderStatusTransform(order.order_status)}</td>
                        <td>{PaymentStatusTransform(order.payment_status)}</td>
                        <td>
                          {ShippingStatusTransform(order.shipping_status)}
                        </td>
                        <td>NT${Number(order.total).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="row">
              <div className="col-sm-8">
                <div className="card text-center mb-4">
                  <div className="card-body">
                    <h6 className="card-title">累積消費金額</h6>
                    <p className="card-text fs-4 fw-bold">
                      NT${totalSpent.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="card text-center mb-4">
                  <div className="card-body">
                    <h6 className="card-title">消費次數</h6>
                    <p className="card-text fs-4 fw-bold">{orderCount}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">聯絡地址</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">姓名</label>
                  <input
                    type="text"
                    className="form-control"
                    disabled
                    value={userName}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">聯絡電話</label>
                  <input
                    type="text"
                    className="form-control"
                    disabled
                    value={getValues("mobile_phone") || ""}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">收件地址</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    {...register("address")}
                    onChange={(e) => {
                      register("address").onChange(e);
                    }}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Member Groups */}
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">會員群組</h5>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={handleOpenGroupModal}
                >
                  <i className="bi bi-pencil me-1"></i>編輯群組
                </button>
              </div>
              <div className="card-body">
                {memberGroupName ? (
                  <span className="badge bg-primary">{memberGroupName}</span>
                ) : (
                  <span className="text-muted">尚未分配群組</span>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">備註</h5>
              </div>
              <div className="card-body">
                <textarea
                  className="form-control"
                  rows={4}
                  {...register("notes")}
                  onChange={(e) => {
                    register("notes").onChange(e);
                  }}
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </form>

      <BlockMemberModal
        id="blockMemberModal"
        title={modalOperation === "block" ? "停權會員" : "解封會員"}
        members={typeof memberId === "string" ? [memberId] : []}
        show={showBlockMemberModal}
        onClose={() => setShowBlockMemberModal(false)}
        operation={modalOperation}
        onSuccess={() => {
          setIsblock(isBlock === 1 ? 0 : 1);
          setShowBlockMemberModal(false);
        }}
      />

      <GroupMembersModal
        id="groupMembersModal"
        title="會員群組設定"
        groups={groupsList || []}
        selectedGroup={selectedGroup}
        onSelectGroup={handleSelectGroup}
        onApply={handleApplyGroup}
        onClose={handleCloseGroupModal}
        show={showMemberGroupModal}
      />

      <SendResetPasswordEmailModal
        id="resetPasswordModal"
        title="發送密碼重設郵件"
        show={showResetPasswordModal}
        email={getValues("email")}
        mobilePhone={getValues("mobile_phone")}
        onClose={() => setShowResetPasswordModal(false)}
        onConfirm={handleSendResetPasswordEmail}
      />

      <SendMessageModal
        show={showSendMessageModal}
        onClose={() => setShowSendMessageModal(false)}
        onSend={handleSendMessage}
        memberName={userName}
      />
    </div>
  );
};

export default MemberDetail;
