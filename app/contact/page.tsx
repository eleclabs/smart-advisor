import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ติดต่อเรา | Smart Advisor",
  description: "ช่องทางและคำแนะนำในการติดต่อทีมงาน Smart Advisor"
};

const contactTopics = [
  {
    title: "การใช้งานระบบ",
    description: "สอบถามขั้นตอนการบันทึกข้อมูล การคัดกรอง การจัดกิจกรรม หรือการใช้งานเมนูต่างๆ",
    channel: "ติดต่อผู้ดูแลระบบ Smart Advisor ของสถานศึกษา"
  },
  {
    title: "บัญชีและสิทธิ์การเข้าถึง",
    description: "แจ้งปัญหาเข้าสู่ระบบ บทบาทไม่ถูกต้อง หรือไม่สามารถเข้าถึงข้อมูลที่รับผิดชอบ",
    channel: "ติดต่อผู้ดูแลระบบพร้อมแจ้งชื่อและอีเมลที่ลงทะเบียน"
  },
  {
    title: "ข้อมูลผู้เรียนและการดูแลช่วยเหลือ",
    description: "ประสานงานเรื่องข้อมูลผู้เรียน การติดตาม การช่วยเหลือ หรือแนวทางการส่งต่อ",
    channel: "ติดต่อครูที่ปรึกษาหรืองานดูแลช่วยเหลือผู้เรียนของสถานศึกษา"
  },
  {
    title: "ความเป็นส่วนตัวและความปลอดภัย",
    description: "แจ้งข้อมูลคลาดเคลื่อน การเข้าถึงที่ผิดปกติ หรือข้อกังวลเกี่ยวกับข้อมูลส่วนบุคคล",
    channel: "ติดต่อผู้ดูแลระบบหรือผู้รับผิดชอบการคุ้มครองข้อมูลของสถานศึกษาโดยเร็ว"
  }
];

export default function ContactPage() {
  return (
    <section className="public-page">
      <div className="public-hero contact-hero">
        <p className="public-eyebrow">ติดต่อเรา</p>
        <h1>พร้อมช่วยให้การใช้งาน Smart Advisor เป็นเรื่องชัดเจน</h1>
        <p>
          หากพบปัญหาในการใช้งาน ต้องการคำแนะนำ หรือมีข้อเสนอแนะเกี่ยวกับระบบ
          โปรดเลือกผู้รับผิดชอบให้ตรงกับหัวข้อ เพื่อให้ได้รับการช่วยเหลือรวดเร็วขึ้น
        </p>
      </div>

      <div className="public-section">
        <div className="public-section-heading">
          <p className="public-eyebrow">ช่องทางตามหัวข้อ</p>
          <h2>ควรติดต่อใคร</h2>
        </div>
        <div className="contact-topic-grid">
          {contactTopics.map((topic) => (
            <article className="contact-topic-card" key={topic.title}>
              <h3>{topic.title}</h3>
              <p>{topic.description}</p>
              <strong>{topic.channel}</strong>
            </article>
          ))}
        </div>
      </div>

      <div className="public-section public-section-soft">
        <div className="contact-guide-grid">
          <div>
            <p className="public-eyebrow">ก่อนแจ้งปัญหา</p>
            <h2>ข้อมูลที่ช่วยให้ตรวจสอบได้เร็วขึ้น</h2>
            <ol className="contact-checklist">
              <li>ชื่อ-นามสกุล และบทบาทที่ใช้งานในระบบ</li>
              <li>ชื่อเมนูหรือหน้าที่พบปัญหา</li>
              <li>ลำดับขั้นตอนก่อนเกิดปัญหาและข้อความแจ้งเตือนที่พบ</li>
              <li>วันและเวลาที่เกิดปัญหาโดยประมาณ</li>
              <li>ภาพหน้าจอที่ไม่เปิดเผยข้อมูลส่วนบุคคลเกินความจำเป็น</li>
            </ol>
          </div>
          <aside className="contact-security-note">
            <span>ข้อควรระวัง</span>
            <h3>อย่าส่งรหัสผ่านหรือข้อมูลลับผ่านข้อความ</h3>
            <p>
              เจ้าหน้าที่ไม่จำเป็นต้องขอรหัสผ่านของคุณ หากสงสัยว่าบัญชีถูกเข้าถึง
              ให้แจ้งผู้ดูแลระบบและเปลี่ยนรหัสผ่านทันที
            </p>
          </aside>
        </div>
      </div>

      <div className="public-callout contact-callout">
        <div>
          <p className="public-eyebrow">เริ่มต้นใช้งาน</p>
          <h2>กลับเข้าสู่ระบบเพื่อดำเนินงานต่อ</h2>
          <p>เข้าสู่ระบบเพื่อตรวจสอบข้อมูลและใช้งานเมนูตามสิทธิ์ของคุณ</p>
        </div>
        <Link className="public-primary-link" href="/login">เข้าสู่ระบบ</Link>
      </div>
    </section>
  );
}
