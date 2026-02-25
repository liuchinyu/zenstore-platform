"use client";
import { CategoryModal } from "@/components/modal";
import { useAppDispatch } from "@/hooks/redux";
import { createTag, fetchTags } from "@/store/tagSlice";
import { createGroup } from "@/store/memberSlice";
import { useState, useEffect } from "react";

interface InteractButtonProps {
  title: string;
  props: string;
}

const InteractButton = ({ title, props }: InteractButtonProps) => {
  const dispatch = useAppDispatch();
  const [tag, setTag] = useState("");
  const [groupName, setGroupName] = useState("");

  const handleCreateTag = () => {
    dispatch(createTag(tag));
  };

  const handleCreateGroup = () => {
    dispatch(createGroup(groupName));
  };

  return (
    <>
      <button
        className="btn btn-primary"
        data-bs-toggle="modal"
        data-bs-target={`${
          props === "createGroup" ? "#groupModal" : "#tagModal"
        }`}
        data-bs-title={title}
        data-bs-props={props}
      >
        {title}
      </button>
      <CategoryModal
        id={`${props === "createGroup" ? "groupModal" : "tagModal"}`}
        title={title}
      >
        <form action="">
          <div className="text-start">
            <label htmlFor="" className="form-label text-start">
              {props === "createGroup" ? "群組名稱" : "標籤名稱"}
            </label>
          </div>

          <input
            type="text"
            className="form-control mb-2"
            value={props === "createGroup" ? groupName : tag}
            onChange={(e) =>
              props === "createGroup"
                ? setGroupName(e.target.value)
                : setTag(e.target.value)
            }
          />
          <button
            type="button"
            className="btn btn-secondary me-2"
            data-bs-dismiss="modal"
          >
            取消
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            onClick={
              props === "createGroup" ? handleCreateGroup : handleCreateTag
            }
          >
            新增
          </button>
        </form>
      </CategoryModal>
    </>
  );
};

export default InteractButton;
