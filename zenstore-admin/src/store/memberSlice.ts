import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  isAnyOf,
} from "@reduxjs/toolkit";
import MemberService from "@/services/memberService";
import { BlockMember } from "@/types/products/memberType";

export type ApiStatus = "idle" | "loading" | "succeeded" | "failed"; //對應API Pending、Fulfilled、Rejected

interface MemberState {
  members: any[];
  totalCount: number;
  groups: any[];
  groupRelation: any[];
  membersStatus: ApiStatus;
  groupsStatus: ApiStatus;
  groupRelationStatus: ApiStatus;
  isLoading: boolean;
  error: string | null;
  activeRequests: number;
}

const initialState: MemberState = {
  members: [],
  totalCount: 0,
  groups: [],
  groupRelation: [],
  membersStatus: "idle",
  groupsStatus: "idle",
  groupRelationStatus: "idle",
  isLoading: false,
  error: null,
  activeRequests: 0,
};

// 取得所有會員
export const fetchMembers = createAsyncThunk(
  "member/fetchMembers",
  async ({ page, pageSize, filters }: any, { rejectWithValue }) => {
    try {
      const response = await MemberService.getMemberList(
        page,
        pageSize,
        filters,
      );
      if (response.success) {
        return response.data;
      }
      return { data: [], totalCount: 0 };
    } catch (error) {
      return rejectWithValue("獲取會員列表失敗");
    }
  },
);

// 取得個人會員
export const fetchMemberById = createAsyncThunk(
  "member/fetchMemberById",
  async (member_id: string, { rejectWithValue }) => {
    try {
      const response = await MemberService.getMemberById(member_id);
      console.log("member_id_response", response);
      return response.data;
    } catch (error) {
      return rejectWithValue("獲取個人會員失敗");
    }
  },
);

// 更新個人會員資料
export const updateMember = createAsyncThunk(
  "member/updateMember",
  async ([member_id, data]: [string, any], { rejectWithValue }) => {
    try {
      const response = await MemberService.updateMember(member_id, data);
      return response;
    } catch (error) {
      return rejectWithValue("更新個人會員資料失敗");
    }
  },
);

// 發送修改密碼信件
export const sendResetPasswordEmail = createAsyncThunk(
  "member/sendResetPasswordEmail",
  async ([email, mobilePhone]: [string, string], { rejectWithValue }) => {
    try {
      const response = await MemberService.sendResetPasswordEmail(
        email,
        mobilePhone,
      );
      return response;
    } catch (error) {
      return rejectWithValue("發送修改密碼信件失敗");
    }
  },
);

//停權 or 解封會員
export const MemberOperation = createAsyncThunk(
  "member/MemberOperation",
  async (blockMember: BlockMember, { rejectWithValue }) => {
    try {
      const response = await MemberService.MemberOperation(blockMember);
      return {
        response,
        blockMember,
      };
    } catch (error) {
      return rejectWithValue("操作會員失敗");
    }
  },
);
// 新增會員群組
export const createGroup = createAsyncThunk(
  "member/createGroup",
  async (groupName: string, { rejectWithValue }) => {
    try {
      const response = await MemberService.createGroup(groupName);
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  },
);
// 取得會員群組列表
export const fetchGroupList = createAsyncThunk(
  "member/fetchGroupList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await MemberService.getGroupList();
      if (response.success) {
        return response.data;
      }

      return [];
    } catch (error) {
      console.log("error", error);
      return rejectWithValue("獲取會員群組列表失敗");
    }
  },
);
// 取得會員群組關聯
export const fetchGroupRelation = createAsyncThunk(
  "member/fetchGroupRelation",
  async (_, { rejectWithValue }) => {
    try {
      const response = await MemberService.getGroupRelation();
      if (response.success) {
        return response.data;
      }
      return [];
    } catch (error) {
      return rejectWithValue("獲取會員群組關聯失敗");
    }
  },
);

// 套用會員群組
export const applyGroup = createAsyncThunk(
  "member/applyGroup",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await MemberService.applyGroup(payload);
      if (response && response.success) {
        return response.data.data;
      }
      return rejectWithValue("套用會員群組失敗");
    } catch (error) {}
  },
);
export const memberSlice = createSlice({
  name: "member",
  initialState,
  reducers: {
    setMembers: (state, action: PayloadAction<any[]>) => {
      state.members = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembers.pending, (state) => {
        state.membersStatus = "loading";
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.membersStatus = "succeeded";
        state.members = action.payload.data;
        state.totalCount = action.payload.totalCount;
      })
      .addCase(fetchMembers.rejected, (state) => {
        state.membersStatus = "failed";
      })
      .addCase(MemberOperation.fulfilled, (state, action) => {
        const { response, blockMember } = action.payload;
        if (response.success) {
          const memberId = blockMember.member_id;
          const isBlocklist = blockMember.is_blocklist;
          const block_reason = blockMember.block_reason;
          const block_date = blockMember.block_date;
          state.members = state.members.map((member) => {
            if (memberId.includes(member.member_id)) {
              return {
                ...member,
                is_blocklist: isBlocklist,
                block_reason,
                block_date,
              };
            }
            return member;
          });
        }
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.groups = [...state.groups, action.payload];
      })
      .addCase(fetchGroupList.pending, (state) => {
        state.groupsStatus = "loading";
      })
      .addCase(fetchGroupList.fulfilled, (state, action) => {
        state.groupsStatus = "succeeded";
        state.groups = action.payload;
      })
      .addCase(fetchGroupList.rejected, (state) => {
        state.groupsStatus = "failed";
      })
      .addCase(fetchGroupRelation.pending, (state) => {
        state.groupRelationStatus = "loading";
      })
      .addCase(fetchGroupRelation.fulfilled, (state, action) => {
        state.groupRelationStatus = "succeeded";
        state.groupRelation = action.payload;
      })
      .addCase(fetchGroupRelation.rejected, (state) => {
        state.groupRelationStatus = "failed";
      })
      .addCase(applyGroup.fulfilled, (state, action) => {
        state.groups = action.payload.group;
        state.groupRelation = action.payload.group_relation;
      })
      // 使用 matcher 統一處理多 thunk 的 pending/fulfilled/rejected
      .addMatcher(
        isAnyOf(
          fetchMembers.pending,
          fetchMemberById.pending,
          updateMember.pending,
          sendResetPasswordEmail.pending,
          MemberOperation.pending,
          createGroup.pending,
          fetchGroupList.pending,
          fetchGroupRelation.pending,
          applyGroup.pending,
        ),
        (state) => {
          state.activeRequests += 1;
          if (!state.isLoading) state.isLoading = true;
          state.error = null;
        },
      )
      .addMatcher(
        isAnyOf(
          fetchMembers.fulfilled,
          fetchMemberById.fulfilled,
          updateMember.fulfilled,
          sendResetPasswordEmail.fulfilled,
          MemberOperation.fulfilled,
          createGroup.fulfilled,
          fetchGroupList.fulfilled,
          fetchGroupRelation.fulfilled,
          applyGroup.fulfilled,
        ),
        (state) => {
          const next = Math.max(0, state.activeRequests - 1);
          state.activeRequests = next;
          const nextLoading = next > 0;
          if (state.isLoading !== nextLoading) state.isLoading = nextLoading;
        },
      )
      .addMatcher(
        isAnyOf(
          fetchMembers.rejected,
          fetchMemberById.rejected,
          updateMember.rejected,
          sendResetPasswordEmail.rejected,
          MemberOperation.rejected,
          createGroup.rejected,
          fetchGroupList.rejected,
          fetchGroupRelation.rejected,
          applyGroup.rejected,
        ),
        (state, action) => {
          const next = Math.max(0, state.activeRequests - 1);
          state.activeRequests = next;
          const nextLoading = next > 0;
          if (state.isLoading !== nextLoading) state.isLoading = nextLoading;
          state.error =
            (action.payload as string) ||
            action.error?.message ||
            "發生未知錯誤";
        },
      );
  },
});

export const { setMembers, setLoading, setError } = memberSlice.actions;
export default memberSlice.reducer;
