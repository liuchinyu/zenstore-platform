import { Router, RequestHandler } from "express";
import {
  getMember,
  getMemberById,
  memberOperation,
  addGroup,
  getGroup,
  applyGroup,
  getGroupRelation,
  updateGroupCount,
  updateMemberById,
} from "@/models/admin/member/member.model";
import { chatwootService } from "@/services/admin/chatwoot.service";

const router = Router();

// 取得會員資料
router.get("/", (async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 100;
    const filters = req.query.filters;
    const result = await getMember(page, pageSize, filters);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      success: false,
      message: "查詢失敗",
    });
  }
}) as RequestHandler);

// 停權 or 解封會員
router.post("/operation", (async (req, res) => {
  const { blockMember } = req.body;
  const result = await memberOperation(blockMember);
  res.send(result);
}) as RequestHandler);

// 新增群組
router.post("/group", (async (req, res) => {
  const { groupName } = req.body;
  const result = await addGroup(groupName);
  res.send(result);
}) as RequestHandler);

// 取得群組
router.get("/group", (async (req, res) => {
  try {
    const result = await getGroup();
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      success: false,
      message: "查詢失敗",
    });
  }
}) as RequestHandler);

// 取得群組關聯
router.get("/groupRelation", (async (req, res) => {
  try {
    const result = await getGroupRelation();
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      success: false,
      message: "查詢失敗",
    });
  }
}) as RequestHandler);

// 套用群組
router.post("/applyGroup", (async (req, res) => {
  try {
    let { payload } = req.body;
    const result = await applyGroup(payload);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      success: false,
      message: "套用群組失敗",
    });
  }
}) as RequestHandler);

// 更新群組會員數量
router.patch("/updateGroupCount", (async (req, res) => {
  const result = await updateGroupCount();
  res.send(result);
}) as RequestHandler);

// 查詢指定會員
router.get("/:member_id", (async (req, res) => {
  const { member_id } = req.params;
  const result = await getMemberById(member_id);
  res.send(result);
}) as RequestHandler);

router.patch("/:member_id", (async (req, res) => {
  const { data } = req.body;
  const member_id = req.params.member_id;
  const result = await updateMemberById(member_id, data);
  res.send(result);
}) as RequestHandler);

// 發送 Chatwoot 訊息給指定會員
router.post("/:member_id/message", (async (req, res) => {
  const { member_id } = req.params;
  const { email, userName, message } = req.body;

  if (!message || typeof message !== "string" || message.trim() === "") {
    return res
      .status(400)
      .send({ success: false, message: "訊息內容不可為空" });
  }

  try {
    // 步驟 1: 根據 ID 獲取會員的詳細資訊

    // 步驟 2: 準備傳遞給 Chatwoot 服務的資料
    // 我們將使用 MEMBER_ID 作為 Chatwoot 聯絡人的唯一識別碼 (identifier)
    const memberInfo = {
      identifier: member_id,
      name: userName,
      email: email,
    };

    // 步驟 3: 呼叫服務發送訊息
    await chatwootService.sendMessageToMember(memberInfo, message);

    res.status(200).send({ success: true, message: "訊息已成功發送" });
  } catch (error) {
    console.error(`向會員 ${member_id} 發送訊息時發生錯誤:`, error);
    res.status(500).send({ success: false, message: "發送訊息失敗" });
  }
}) as RequestHandler);

export default router;
