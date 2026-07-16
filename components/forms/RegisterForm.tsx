"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { registerAction, type AuthActionState } from "@/actions/auth.action";

const initialState: AuthActionState = {
  status: "idle",
  message: ""
};

export default function RegisterForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(registerAction, initialState);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [provinceOptions, setProvinceOptions] = useState<string[]>([]);
  const [vocationalOfficeOptions, setVocationalOfficeOptions] = useState<string[]>([]);
  const [educationTypeOptions, setEducationTypeOptions] = useState<string[]>([]);
  const [schoolProvinceOptions, setSchoolProvinceOptions] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedVocationalOffice, setSelectedVocationalOffice] = useState("");
  const [selectedEducationType, setSelectedEducationType] = useState("");
  const [selectedSchoolProvince, setSelectedSchoolProvince] = useState("");
  const [schoolQuery, setSchoolQuery] = useState("");
  const [schoolResults, setSchoolResults] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (state.status === "success") {
      alert(state.message);
      router.push("/login");
    }
  }, [router, state.message, state.status]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();

    if (selectedRegion) params.set("region", selectedRegion);
    if (selectedProvince) params.set("province", selectedProvince);
    if (selectedVocationalOffice) params.set("vocationalOffice", selectedVocationalOffice);
    if (selectedEducationType) params.set("educationType", selectedEducationType);

    fetch(`/api/schools/options?${params.toString()}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data) => {
        setRegionOptions(Array.isArray(data.regions) ? data.regions : []);
        setProvinceOptions(Array.isArray(data.provinces) ? data.provinces : []);
        setVocationalOfficeOptions(Array.isArray(data.vocationalOffices) ? data.vocationalOffices : []);
        setEducationTypeOptions(Array.isArray(data.educationTypes) ? data.educationTypes : []);
        setSchoolProvinceOptions(Array.isArray(data.schoolProvinces) ? data.schoolProvinces : []);
      })
      .catch(() => {
        setRegionOptions([]);
        setProvinceOptions([]);
        setVocationalOfficeOptions([]);
        setEducationTypeOptions([]);
        setSchoolProvinceOptions([]);
      });

    return () => controller.abort();
  }, [selectedRegion, selectedProvince, selectedVocationalOffice, selectedEducationType]);

  // Search schools (debounced)
  useEffect(() => {
    if (!schoolQuery) {
      setSchoolResults([]);
      return;
    }

    const abort = new AbortController();
    const id = setTimeout(() => {
      const params = new URLSearchParams();
      params.set("q", schoolQuery);
      if (selectedRegion) params.set("region", selectedRegion);
      if (selectedProvince) params.set("province", selectedProvince);
      if (selectedVocationalOffice) params.set("vocationalOffice", selectedVocationalOffice);
      if (selectedEducationType) params.set("educationType", selectedEducationType);
      if (selectedSchoolProvince) params.set("schoolProvince", selectedSchoolProvince);

      fetch(`/api/schools/search?${params.toString()}`, { signal: abort.signal })
        .then((r) => r.json())
        .then((data) => {
          setSchoolResults(Array.isArray(data) ? data : []);
        })
        .catch(() => setSchoolResults([]));
    }, 300);

    return () => {
      clearTimeout(id);
      abort.abort();
    };
  }, [schoolQuery, selectedRegion, selectedProvince, selectedVocationalOffice, selectedEducationType, selectedSchoolProvince]);

  return (
    <div className="auth-page">
      <form className="auth-card register-card" action={formAction}>
        <h2>สมัครสมาชิก</h2>

        {/* Search placed above filters */}
        <section className="register-section">
          <div className="register-section-header">
            <h3>ค้นหาชื่อสถานศึกษา</h3>
            <p>พิมพ์ชื่อสถานศึกษาบางส่วนเพื่อค้นหาและเลือกจากผลลัพธ์</p>
          </div>

          <div className="register-grid">
            <div style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="schoolSearch">ค้นหาสถานศึกษา</label>
              <input
                id="schoolSearch"
                placeholder="พิมพ์ชื่อสถานศึกษาที่ต้องการ"
                value={schoolQuery}
                onChange={(e) => {
                  setSchoolQuery(e.target.value);
                  setSelectedSchool(null);
                }}
              />

              {selectedSchool ? (
                <div className="selected-school">
                  <strong>สถานศึกษาที่เลือก:</strong> {selectedSchool.name}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSchool(null);
                      setSchoolQuery("");
                      setSchoolResults([]);
                    }}
                  >
                    ล้าง
                  </button>
                </div>
              ) : null}

              {schoolResults.length > 0 && !selectedSchool ? (
                <ul className="school-results">
                  {schoolResults.map((s) => (
                    <li key={s.id || s._id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSchool({ id: s.id || s._id, name: s.name });
                          // populate filters based on selected school
                          setSelectedRegion(s.region || "");
                          setSelectedProvince(s.province || "");
                          setSelectedVocationalOffice(s.vocationalOffice || "");
                          setSelectedEducationType(s.educationType || "");
                          setSelectedSchoolProvince(s.province || "");
                          setSchoolResults([]);
                          setSchoolQuery(s.name);
                        }}
                      >
                        {s.name} {s.province ? `(${s.province})` : ""}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </section>

        <section className="register-section">
          <div className="register-section-header">
            <h3>เลือกสถานศึกษาจากฐานข้อมูล</h3>
            <p>เลือกเฉพาะค่าที่มีอยู่ในฐานข้อมูลสถานศึกษา</p>
          </div>

          <div className="register-grid">
            <div>
              <label htmlFor="region">ภาค</label>
              <select
                id="region"
                name="region"
                required
                value={selectedRegion}
                onChange={(event) => {
                  setSelectedRegion(event.target.value);
                  setSelectedProvince("");
                  setSelectedVocationalOffice("");
                  setSelectedEducationType("");
                  setSelectedSchoolProvince("");
                }}
              >
                <option value="">-- กรุณาเลือก --</option>
                {regionOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="province">จังหวัด</label>
              <select
                id="province"
                name="province"
                required
                value={selectedProvince}
                onChange={(event) => {
                  setSelectedProvince(event.target.value);
                  setSelectedVocationalOffice("");
                  setSelectedEducationType("");
                  setSelectedSchoolProvince("");
                }}
              >
                <option value="">-- กรุณาเลือก --</option>
                {provinceOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="vocationalOffice">อาชีวศึกษาจังหวัด</label>
              <select
                id="vocationalOffice"
                name="vocationalOffice"
                required
                value={selectedVocationalOffice}
                onChange={(event) => {
                  setSelectedVocationalOffice(event.target.value);
                  setSelectedEducationType("");
                  setSelectedSchoolProvince("");
                }}
              >
                <option value="">-- กรุณาเลือก --</option>
                {vocationalOfficeOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="educationType">ประเภทสถานศึกษา</label>
              <select
                id="educationType"
                name="educationType"
                required
                value={selectedEducationType}
                onChange={(event) => {
                  setSelectedEducationType(event.target.value);
                  setSelectedSchoolProvince("");
                }}
              >
                <option value="">-- กรุณาเลือก --</option>
                {educationTypeOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="schoolProvince">จังหวัดของสถานศึกษา</label>
              <select
                id="schoolProvince"
                name="schoolProvince"
                required
                value={selectedSchoolProvince}
                onChange={(event) => setSelectedSchoolProvince(event.target.value)}
              >
                <option value="">-- กรุณาเลือก --</option>
                {schoolProvinceOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="register-section">
          <div className="register-section-header">
            <h3>ข้อมูลผู้ลงทะเบียน</h3>
          </div>

          <div className="register-grid">
            <div>
              <label htmlFor="title">เพศ</label>
              <select id="title" name="gender">
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
              </select>
            </div>

            <div>
              <label htmlFor="title">คำนำหน้านาม</label>
              <select id="title" name="title" required>
                <option value="">-- กรุณาเลือก --</option>
                <option value="นาย">นาย</option>
                <option value="นาง">นาง</option>
                <option value="นางสาว">นางสาว</option>
              </select>
            </div>

            <div>
              <label htmlFor="firstNameTh">ชื่อ (ไทย)</label>
              <input id="firstNameTh" name="firstNameTh" placeholder="ชื่อ (ไทย)" required />
            </div>

            <div>
              <label htmlFor="lastNameTh">นามสกุล (ไทย)</label>
              <input id="lastNameTh" name="lastNameTh" placeholder="นามสกุล (ไทย)" required />
            </div>

            <div>
              <label htmlFor="firstNameEn">ชื่อ (อังกฤษ)</label>
              <input id="firstNameEn" name="firstNameEn" placeholder="ชื่อ (อังกฤษ)" required />
            </div>

            <div>
              <label htmlFor="lastNameEn">นามสกุล (อังกฤษ)</label>
              <input id="lastNameEn" name="lastNameEn" placeholder="นามสกุล (อังกฤษ)" required />
            </div>

            <div>
              <label htmlFor="email">อีเมลที่ติดต่อของท่าน</label>
              <input id="email" name="email" placeholder="you@example.com" type="email" required />
            </div>

            <div>
              <label htmlFor="phone">หมายเลขโทรศัพท์มือถือ</label>
              <input id="phone" name="phone" placeholder="08X-XXX-XXXX" type="tel" required />
            </div>

            <div>
              <label htmlFor="citizenId">หมายเลขบัตรประชาชน</label>
              <input id="citizenId" name="citizenId" placeholder="xxxxxxxxxxxxx" required />
            </div>

            <div>
              <label htmlFor="password">รหัสผ่าน</label>
              <input id="password" name="password" placeholder="อย่างน้อย 6 ตัวอักษร" type="password" minLength={6} required />
            </div>

            <div>
              <label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</label>
              <input id="confirmPassword" name="confirmPassword" placeholder="ยืนยันรหัสผ่าน" type="password" minLength={6} required />
            </div>
          </div>
        </section>

        {state.message ? (
          <p className={`auth-message auth-message-${state.status}`} aria-live="polite">
            {state.message}
          </p>
        ) : null}

        {selectedSchool ? (
          <>
            <input type="hidden" name="schoolId" value={selectedSchool.id} />
            <input type="hidden" name="schoolName" value={selectedSchool.name} />
          </>
        ) : null}

        <button type="submit" disabled={pending}>
          {pending ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
        </button>

        <p className="auth-help">
          มีบัญชีแล้ว? <Link href="/login">เข้าสู่ระบบ</Link>
        </p>
      </form>
    </div>
  );
}
