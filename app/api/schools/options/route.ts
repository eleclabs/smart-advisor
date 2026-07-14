import { NextResponse } from "next/server";
import { SchoolRepository } from "@/repositories/school.repository";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const region = String(url.searchParams.get("region") || "").trim();
  const province = String(url.searchParams.get("province") || "").trim();
  const vocationalOffice = String(url.searchParams.get("vocationalOffice") || "").trim();
  const educationType = String(url.searchParams.get("educationType") || "").trim();

  const regionFilter: Record<string, string> = {};
  const provinceFilter: Record<string, string> = {};
  const vocationalOfficeFilter: Record<string, string> = {};
  const educationTypeFilter: Record<string, string> = {};
  const schoolProvinceFilter: Record<string, string> = {};

  if (region) {
    provinceFilter.region = region;
    vocationalOfficeFilter.region = region;
    educationTypeFilter.region = region;
    schoolProvinceFilter.region = region;
  }

  if (province) {
    vocationalOfficeFilter.province = province;
    educationTypeFilter.province = province;
    schoolProvinceFilter.province = province;
  }

  if (vocationalOffice) {
    educationTypeFilter.vocationalOffice = vocationalOffice;
    schoolProvinceFilter.vocationalOffice = vocationalOffice;
  }

  if (educationType) {
    schoolProvinceFilter.educationType = educationType;
  }

  const [regions, provinces, vocationalOffices, educationTypes, schoolProvinces] =
    await Promise.all([
      SchoolRepository.distinctValues("region"),
      SchoolRepository.distinctValues("province", region ? { region } : {}),
      SchoolRepository.distinctValues("vocationalOffice", province ? { region, province } : region ? { region } : {}),
      SchoolRepository.distinctValues("educationType", vocationalOffice ? { region, province, vocationalOffice } : province ? { region, province } : region ? { region } : {}),
      SchoolRepository.distinctValues("province", schoolProvinceFilter)
    ]);

  return NextResponse.json({
    regions: regions.sort((a, b) => a.localeCompare(b, "th")),
    provinces: provinces.sort((a, b) => a.localeCompare(b, "th")),
    vocationalOffices: vocationalOffices.sort((a, b) => a.localeCompare(b, "th")),
    educationTypes: educationTypes.sort((a, b) => a.localeCompare(b, "th")),
    schoolProvinces: schoolProvinces.sort((a, b) => a.localeCompare(b, "th"))
  });
}
