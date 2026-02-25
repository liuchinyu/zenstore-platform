"use client";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useParams } from "next/navigation";
import { fetchAnnouncements } from "@/store/contentSlice";

export default function AnnouncementDetail() {
  const { announcements_id } = useParams();
  const dispatch = useAppDispatch();

  const announcement = useAppSelector(
    (state: any) => state.content?.announcements,
  );

  useEffect(() => {
    if (!announcement || announcement.length === 0) {
      dispatch(fetchAnnouncements());
    }
  }, [announcement]);

  const filteredAnnouncement = announcement?.filter(
    (announcement: any) =>
      announcement.ANNOUNCEMENTS_ID === Number(announcements_id),
  );

  return (
    <>
      {filteredAnnouncement && filteredAnnouncement.length > 0 && (
        <div className="container py-5">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <h1>{filteredAnnouncement[0].TITLE}</h1>
                  <p>{filteredAnnouncement[0].CONTENT}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
