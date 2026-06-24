import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ยินดีต้อนรับ | Smart Advisor",
  description: "Smart Advisor ระบบดูแล ช่วยเหลือ และติดตามผู้เรียนอย่างเป็นระบบ"
};

const careSteps = [
  "การรู้จักผู้เรียนเป็นรายบุคคล",
  "การคัดกรองผู้เรียน",
  "การส่งเสริมและพัฒนาผู้เรียน",
  "การป้องกันและแก้ปัญหาผู้เรียน",
  "การส่งต่อผู้เรียน",
];

const highlights = [
  {
    number: "01",
    title: "ข้อมูลอยู่ในที่เดียว",
    description: "รวบรวมข้อมูลสำคัญของผู้เรียน แผนช่วยเหลือ และประวัติการติดตามให้ค้นหาได้สะดวก"
  },
  {
    number: "02",
    title: "เห็นความต้องการได้เร็ว",
    description: "ใช้ข้อมูลคัดกรองเพื่อมองเห็นผู้เรียนที่ต้องได้รับการส่งเสริมหรือช่วยเหลือเป็นพิเศษ"
  },
  {
    number: "03",
    title: "ติดตามได้ต่อเนื่อง",
    description: "บันทึกกิจกรรม การแก้ปัญหา การส่งต่อ และผลลัพธ์ เพื่อไม่ให้การดูแลผู้เรียนตกหล่น"
  }
];

export default function HomePage() {
  return (
    <section className="home-page">
      <div className="home-hero">
        <div className="home-hero-content">
          <p className="home-welcome-badge">ยินดีต้อนรับสู่ Smart Advisor</p>
          <h1>ดูแลผู้เรียนอย่างเข้าใจ<br />ก้าวไปด้วยกันอย่างมั่นใจ</h1>
          <p className="home-hero-description">
            ระบบสนับสนุนงานครูที่ปรึกษาและการดูแลช่วยเหลือผู้เรียน
            ตั้งแต่การรู้จักผู้เรียนรายบุคคล การคัดกรอง การส่งเสริมพัฒนา
            ไปจนถึงการแก้ปัญหาและติดตามผลอย่างต่อเนื่อง
          </p>
          <div className="home-actions">
            <Link className="home-primary-link" href="/login">เข้าสู่ระบบ</Link>
            <Link className="home-secondary-link" href="/about">รู้จักเรามากขึ้น</Link>
          </div>
          <div className="home-trust-list" aria-label="จุดเด่นของระบบ">
            <span>ข้อมูลเป็นระบบ</span>
            <span>ใช้งานตามสิทธิ์</span>
            <span>ติดตามได้ต่อเนื่อง</span>
          </div>
        </div>

        <aside className="home-care-card" aria-label="วงจรการดูแลผู้เรียน">
          <div className="home-care-card-header">
            <div>
              <h2>การดูแลช่วยเหลือผู้เรียน</h2>
            </div>
            <strong>5</strong>
          </div>
          <ol className="home-care-steps">
            {careSteps.map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step}</strong>
              </li>
            ))}
          </ol>
          <p>ทุกขั้นตอนเชื่อมต่อกัน เพื่อให้ผู้เรียนได้รับการดูแลที่เหมาะสม</p>
        </aside>
      </div>

      <div className="home-intro">
        <div>
          <p className="public-eyebrow">Smart Advisor ช่วยอะไร</p>
          <h2>เปลี่ยนข้อมูลให้เป็นการดูแลที่เกิดผลจริง</h2>
        </div>
        <p>
          ลดภาระการจัดเก็บข้อมูลแบบกระจัดกระจาย ช่วยให้ครูมองเห็นภาพรวม
          วางแผนช่วยเหลือ และประสานงานกับผู้เกี่ยวข้องได้ชัดเจนขึ้น
        </p>
      </div>

      <div className="home-highlight-grid">
        {highlights.map((highlight) => (
          <article className="home-highlight-card" key={highlight.number}>
            <span>{highlight.number}</span>
            <h3>{highlight.title}</h3>
            <p>{highlight.description}</p>
          </article>
        ))}
      </div>

      <div className="home-roles">
        <div className="home-roles-copy">
          <p className="public-eyebrow">ทำงานร่วมกัน</p>
          <h2>พื้นที่กลางสำหรับทุกฝ่ายที่ร่วมดูแลผู้เรียน</h2>
          <p>
            ครูที่ปรึกษา ผู้ดูแลระบบ คณะกรรมการ และผู้เรียน เข้าถึงข้อมูล
            และเครื่องมือตามบทบาทของตนเอง เพื่อให้การประสานงานมีทิศทางเดียวกัน
          </p>
          <Link href="/about">ดูรายละเอียดเกี่ยวกับระบบ</Link>
        </div>
        <div className="home-role-grid">
          <article><strong>ครูที่ปรึกษา</strong><span>บันทึกและติดตามการดูแล</span></article>
          <article><strong>ผู้ดูแลระบบ</strong><span>จัดการข้อมูลและดูภาพรวม</span></article>
          <article><strong>คณะกรรมการ</strong><span>ติดตามและใช้ข้อมูลประกอบการพิจารณา</span></article>
        </div>
      </div>

      <div className="home-callout">
        <div>
          <span>พร้อมเริ่มต้นแล้วหรือยัง</span>
          <h2>ร่วมสร้างการดูแลที่ไม่ทิ้งใครไว้ข้างหลัง</h2>
          <p>เข้าสู่ระบบเพื่อดูข้อมูลและเริ่มดำเนินงานตามบทบาทของคุณ</p>
        </div>
        <div className="home-callout-actions">
          <Link className="home-primary-link" href="/login">เข้าสู่ระบบ</Link>
          <Link className="home-contact-link" href="/contact">ติดต่อเรา</Link>
        </div>
      </div>
    </section>
  );
}
