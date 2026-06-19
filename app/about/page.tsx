import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา | Smart Advisor",
  description: "รู้จักระบบ Smart Advisor และแนวทางการดูแลช่วยเหลือผู้เรียน"
};

const features = [
  {
    title: "รู้จักผู้เรียนเป็นรายบุคคล",
    description: "รวบรวมข้อมูลพื้นฐาน ครอบครัว สุขภาพ และข้อมูลที่จำเป็นต่อการดูแลผู้เรียนแต่ละคน"
  },
  {
    title: "คัดกรองอย่างเป็นระบบ",
    description: "บันทึกข้อมูลคัดกรองรายภาคเรียน เพื่อค้นหาความเสี่ยงและความต้องการความช่วยเหลือได้เร็วขึ้น"
  },
  {
    title: "ส่งเสริมและพัฒนา",
    description: "วางแผนกิจกรรม บันทึกผล ปัญหา และผู้เรียนที่ต้องติดตามเป็นพิเศษอย่างต่อเนื่อง"
  },
  {
    title: "ข้อมูลตามสิทธิ์ผู้ใช้งาน",
    description: "กำหนดการเข้าถึงตามบทบาท เพื่อให้ข้อมูลถูกใช้งานโดยผู้ที่เกี่ยวข้องและมีหน้าที่รับผิดชอบ"
  }
];

const userGroups = [
  ["ครูที่ปรึกษา", "บันทึก ติดตาม และวางแผนช่วยเหลือผู้เรียนในความดูแล"],
  ["ผู้ดูแลระบบ", "จัดการข้อมูลหลัก ผู้ใช้งาน และภาพรวมการดำเนินงานของระบบ"],
  ["ผู้เรียน", "เข้าถึงข้อมูลและบริการที่เกี่ยวข้องกับการรับคำปรึกษา"],
  ["คณะกรรมการ", "ติดตาม ตรวจสอบ และใช้ข้อมูลสรุปเพื่อประกอบการพิจารณา"]
];

export default function AboutPage() {
  return (
    <section className="public-page">
      <div className="public-hero">
        <p className="public-eyebrow">เกี่ยวกับ Smart Advisor</p>
        <h1>ระบบดูแลช่วยเหลือผู้เรียนที่เชื่อมข้อมูลกับการลงมือดูแลจริง</h1>
        <p>
          Smart Advisor พัฒนาขึ้นเพื่อช่วยให้สถานศึกษาและครูที่ปรึกษาจัดเก็บ
          ติดตาม และใช้ข้อมูลผู้เรียนได้อย่างเป็นระบบ ตั้งแต่การรู้จักผู้เรียน
          การคัดกรอง ไปจนถึงการส่งเสริม พัฒนา และส่งต่อความช่วยเหลือ
        </p>
        <div className="public-actions">
          <Link className="public-primary-link" href="/login">เข้าสู่ระบบ</Link>
          <Link className="public-secondary-link" href="/contact">ติดต่อเรา</Link>
        </div>
      </div>

      <div className="public-section">
        <div className="public-section-heading">
          <p className="public-eyebrow">เป้าหมายของเรา</p>
          <h2>ทำให้การดูแลผู้เรียนต่อเนื่อง ชัดเจน และไม่ตกหล่น</h2>
        </div>
        <div className="public-story-grid">
          <article className="public-highlight-card">
            <strong>มองเห็นข้อมูลที่สำคัญ</strong>
            <p>รวมข้อมูลที่จำเป็นไว้ในจุดเดียว ลดการค้นหาเอกสารจากหลายแหล่ง</p>
          </article>
          <article className="public-highlight-card">
            <strong>ช่วยเหลือได้ตรงจุด</strong>
            <p>ใช้ข้อมูลคัดกรองและบันทึกติดตามเพื่อวางแนวทางช่วยเหลือที่เหมาะสม</p>
          </article>
          <article className="public-highlight-card">
            <strong>ทำงานร่วมกันได้ดีขึ้น</strong>
            <p>สนับสนุนการประสานงานระหว่างครู ผู้ดูแลระบบ และผู้เกี่ยวข้อง</p>
          </article>
        </div>
      </div>

      <div className="public-section public-section-soft">
        <div className="public-section-heading">
          <p className="public-eyebrow">ความสามารถหลัก</p>
          <h2>เครื่องมือสำหรับงานดูแลช่วยเหลือผู้เรียน</h2>
        </div>
        <div className="public-feature-grid">
          {features.map((feature, index) => (
            <article className="public-feature-card" key={feature.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="public-section">
        <div className="public-section-heading">
          <p className="public-eyebrow">ผู้ใช้งานระบบ</p>
          <h2>ออกแบบให้แต่ละบทบาททำงานได้ตามหน้าที่</h2>
        </div>
        <div className="public-role-list">
          {userGroups.map(([title, description]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="public-callout">
        <div>
          <p className="public-eyebrow">หลักการสำคัญ</p>
          <h2>ข้อมูลที่ดีควรนำไปสู่การดูแลที่ดีขึ้น</h2>
          <p>
            ระบบเป็นเครื่องมือสนับสนุนการทำงาน การพิจารณาและตัดสินใจเกี่ยวกับผู้เรียน
            ยังคงต้องอาศัยความเข้าใจ ความรับผิดชอบ และจรรยาบรรณของผู้เกี่ยวข้อง
          </p>
        </div>
      </div>
    </section>
  );
}
