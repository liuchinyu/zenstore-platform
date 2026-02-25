import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BlockMember } from "@/types/products/memberType";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL + "/member" ||
  "http://localhost:8080/api/admin/member";

const AUTH_URL = "http://localhost:8080/api/auth";

export const memberApi = createApi({
  reducerPath: "memberApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    // prepareHeaders 請求攔截器，用來在請求發送前修改 Headers
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Member", "Group", "GroupRelation"], //定義用於快取管理的名稱列表
  endpoints: (builder) => ({
    // 取得所有會員
    getMembers: builder.query<
      { data: any[]; totalCount: number },
      { page: number; pageSize: number; filters: any }
    >({
      query: ({ page, pageSize, filters }) => {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
        });
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              // 模擬 Axios 的 filters[key]=value 格式
              params.append(`filters[${key}]`, String(value));
            }
          });
          console.log("params", params);
        }
        return {
          url: "", //表直接使用 baseUrl
          params: params, //對應到網址的「問號後面的參數」
        };
      },
      transformResponse: (response: any) => {
        return {
          data: response.data.data || [],
          totalCount: response.data.totalCount || 0,
        };
      },
      providesTags: (result) =>
        result && Array.isArray(result.data)
          ? [
              ...result.data.map(({ member_id }: any) => ({
                type: "Member" as const,
                id: member_id,
              })),
              { type: "Member", id: "LIST" },
            ]
          : [{ type: "Member", id: "LIST" }],
    }),

    // 取得個人會員
    getMemberById: builder.query<any, string>({
      query: (member_id) => `/${member_id}`,
      transformResponse: (response: any) => {
        //transformResponse 過濾後端回傳的資料
        return {
          member: response.data.member || [],
          orders: response.data.orders || [],
        };
      },
      providesTags: (result, error, id) => [{ type: "Member", id }],
    }),

    // 更新個人會員資料
    updateMember: builder.mutation<any, { member_id: string; data: any }>({
      query: ({ member_id, data }) => ({
        url: `/${member_id}`,
        method: "PATCH",
        body: { data },
      }),
      invalidatesTags: (result, error, { member_id }) => [
        { type: "Member", id: member_id },
        { type: "Member", id: "LIST" },
      ],
    }),

    // 發送修改密碼信件
    sendResetPasswordEmail: builder.mutation<
      any,
      { email: string; mobilePhone: string }
    >({
      async queryFn(
        { email, mobilePhone },
        _queryApi,
        _extraOptions,
        fetchWithBQ,
      ) {
        try {
          // 1. Forgot Password
          const forgotResult = await fetchWithBQ({
            url: `${AUTH_URL}/forgot-password`,
            method: "POST",
            body: { email, mobilePhone },
          });

          if (forgotResult.error) return { error: forgotResult.error };

          const userData = (forgotResult.data as any)?.userData;
          if (!userData)
            return { error: { status: 500, data: "No user data returned" } };

          // 2. Send Email
          const emailPayload = {
            email: userData.EMAIL,
            userName: userData.USER_NAME,
            token: userData.VERIFICATION_TOKEN,
          };

          const sendResult = await fetchWithBQ({
            url: `${AUTH_URL}/reset-password-email`,
            method: "POST",
            body: emailPayload,
          });

          if (sendResult.error) return { error: sendResult.error };

          // Combine results to match previous behavior
          return {
            data: {
              success: true,
              message: "重設密碼郵件已發送，請檢查您的信箱",
              userData: userData,
            },
          };
        } catch (error) {
          return { error: error as any };
        }
      },
    }),

    // 停權 or 解封會員
    operateMember: builder.mutation<any, BlockMember>({
      query: (blockMember) => ({
        url: "/operation",
        method: "POST",
        body: { blockMember },
      }),
      invalidatesTags: ["Member"],
    }),

    // 新增會員群組
    createGroup: builder.mutation<any, string>({
      query: (groupName) => ({
        url: "/group",
        method: "POST",
        body: { groupName },
      }),
      invalidatesTags: ["Group", "GroupRelation"],
    }),

    // 取得會員群組列表
    getGroups: builder.query<any[], void>({
      query: () => "/group",
      transformResponse: (response: { success: boolean; data: any[] }) => {
        return response.success ? response.data : [];
      },
      providesTags: ["Group"],
    }),

    // 取得會員群組關聯
    getGroupRelations: builder.query<any[], void>({
      query: () => "/groupRelation",
      transformResponse: (response: { success: boolean; data: any[] }) => {
        return response.success ? response.data : [];
      },
      providesTags: ["GroupRelation"],
    }),

    // 套用會員群組
    applyGroup: builder.mutation<any, any>({
      async queryFn(payload, _queryApi, _extraOptions, fetchWithBQ) {
        try {
          const applyResult = await fetchWithBQ({
            url: "/applyGroup",
            method: "POST",
            body: { payload },
          });

          if (applyResult.error) return { error: applyResult.error };

          const data = applyResult.data as any;
          if (data && data.success) {
            // Update counts
            await fetchWithBQ({
              url: "/updateGroupCount",
              method: "PATCH",
              body: {},
            });
            return { data: data.data };
          }
          return { error: { status: 400, data: "套用會員群組失敗" } };
        } catch (error) {
          return { error: error as any };
        }
      },
      invalidatesTags: ["Group", "GroupRelation", "Member"],
    }),
  }),
});

export const {
  useGetMembersQuery,
  useGetMemberByIdQuery,
  useUpdateMemberMutation,
  useSendResetPasswordEmailMutation,
  useOperateMemberMutation,
  useCreateGroupMutation,
  useGetGroupsQuery,
  useGetGroupRelationsQuery,
  useApplyGroupMutation,
} = memberApi;
