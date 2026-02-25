import Image from "next/image";
const Footer = () => {
  return (
    <div className="container-fluid text-white mt-3 footerBackground">
      <div className="row footerText">
        <div className="col-md-4 col-12 p-3 text-center d-flex justify-content-center text-md-start">
          <div className="text-start">
            <h3 className="h6 text-md-start text-center fw-bold fw-md-normal">
              服務資訊
            </h3>
            <span className="d-md-block d-none">統一編號：12401698</span>
            <span className="mt-1 d-md-block d-none">
              營業時間：09:00~18:00
            </span>
            <span className="mt-1 d-none d-md-block">
              客服信箱：ztstore_service@zenitron.com.tw
            </span>
            <i className="bi bi-envelope-plus fa-1x me-2 icon-sm d-block d-md-none">
              ：ztstore_service@zenitron.com.tw
            </i>
            <span className="mt-1 d-none d-md-block">
              客服電話：(02)2792-8788#502
            </span>
            <i className="bi bi-telephone fa-1x me-2 icon-sm d-block d-md-none">
              ：(02)2792-8788#502
            </i>
            <span className="mt-1 d-none d-md-block">
              營業地址：114台北市內湖區新湖二路250巷8號
            </span>
            <i className="bi bi-geo-alt fa-1x me-2 icon-sm d-block d-md-none">
              ：114台北市內湖區新湖二路250巷8號
            </i>
          </div>
        </div>
        <div className="col-md-2 d-none d-md-block p-3">
          <h3 className="h6">區塊二</h3>
          <a href="" className="footerLink">
            官方網站
          </a>
          <a href="" className="footerLink">
            技術文章
          </a>
        </div>
        <div className="col-md-2 d-none d-md-block p-3">
          <h3 className="h6">區塊三</h3>
          <a href="" className="footerLink">
            常見問題
          </a>
          <a href="" className="footerLink">
            購物說明
          </a>
          <a href="" className="footerLink">
            付款方式
          </a>
        </div>
        <div className="col-md-2 d-none d-md-block p-3">
          <h3 className="h6">區塊四</h3>
        </div>
        <div className="col-md-2 col-12 p-3 text-center text-md-start">
          <h3 className="h6 fw-bold fw-md-normal">關注我們</h3>
          <a href="" className="me-2">
            <Image
              src="/facebook.png"
              alt=""
              className="mediaImage"
              width={20}
              height={20}
            />
          </a>
          <a href="" className="me-2">
            <Image
              src="/instagram.png"
              alt=""
              className="mediaImage"
              width={20}
              height={20}
            />
          </a>
          <a href="" className="me-2">
            <Image
              src="/youtube.png"
              alt=""
              className="mediaImage"
              width={20}
              height={20}
            />
          </a>
          <a href="" className="me-2">
            <Image
              src="/wechat.png"
              alt=""
              className="mediaImage"
              width={20}
              height={20}
            />
          </a>
        </div>
        <div className="col-12 text-center mt-2">
          <span>
            <a href="" className="text-white me-1">
              退貨條款|
            </a>
            <a href="" className="text-white me-1">
              隱私權政策|
            </a>
            <a href="" className="text-white me-1">
              服務條款
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Footer;
