"use client";
import InteractButton from "@/components/ui/InteractButton/InteractButton";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchGroupList } from "@/store/memberSlice";
import { useEffect, useState } from "react";
import Link from "next/link";

const GroupsPage = () => {
  const dispatch = useAppDispatch();
  const { groups, isLoading } = useAppSelector((state) => state.member);
  // 添加一個本地的初始載入狀態
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (groups.length === 0) {
      // 確保在組件掛載時顯示載入指示器
      setInitialLoading(true);

      dispatch(fetchGroupList()).finally(() => {
        // 無論成功或失敗，都將初始載入狀態設為 false
        setInitialLoading(false);
      });
    } else {
      // 如果已經有標籤，則不需要載入
      setInitialLoading(false);
    }
  }, [dispatch, groups.length]);

  // 合併 Redux 和本地的載入狀態
  const showLoading = isLoading || initialLoading;

  return (
    <div className="container-fluid p-3 border-0">
      <div className="row p-3">
        <div className="col-sm-6 col-12">
          <h1 className="h4">會員群組列表</h1>
        </div>
        <div className="col-sm-6 col-12 text-sm-end">
          <InteractButton title="新增群組" props="createGroup" />
        </div>
      </div>
      <div className="row p-4">
        {showLoading ? (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">載入中...</span>
            </div>
          </div>
        ) : groups.length > 0 ? (
          <table className="table table-bordered table-striped table-hover">
            <thead>
              <tr>
                <th>群組名稱</th>
                <th>會員數量</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr key={group.GROUP_ID}>
                  <td>{group.GROUP_NAME}</td>
                  <td>
                    <Link
                      href={`/customers/members?group_id=${
                        group.GROUP_ID
                      }&group=${encodeURIComponent(group.GROUP_NAME)}`}
                      className="text-decoration-none"
                    >
                      {group.GROUP_COUNT}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="alert alert-warning mt-2">
            目前尚無會員群組，請點擊「新增群組」按鈕進行設定
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsPage;
