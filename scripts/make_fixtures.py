# -*- coding: utf-8 -*-
"""가상 연수 자료 생성기. 실행: python3 -I scripts/make_fixtures.py"""
import os
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from pptx import Presentation
from pptx.util import Inches, Pt as PPt
from pptx.dml.color import RGBColor as PRGB
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph,
                                Spacer, Table, TableStyle, PageBreak)

OUT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "fixtures"))
FONT = "Noto Sans KR"
NOTICE = "가상 자료 — 실제 학교·인물과 무관"
SCHOOL = "한빛고등학교"
PHONE = "000-0000-0000"

pdfmetrics.registerFont(TTFont("NSK", "/home/user/pkg/assets/fonts/NotoSansKR-400.ttf"))
pdfmetrics.registerFont(TTFont("NSK-B", "/home/user/pkg/assets/fonts/NotoSansKR-700.ttf"))
pdfmetrics.registerFontFamily("NSK", normal="NSK", bold="NSK-B", italic="NSK", boldItalic="NSK-B")


# ---------------------------------------------------------------- PDF helpers
def S(name, size=10, bold=False, lead=None, align=0, **kw):
    return ParagraphStyle(name, fontName="NSK-B" if bold else "NSK", fontSize=size,
                          leading=lead or size * 1.55, alignment=align, wordWrap="CJK", **kw)


BODY, SMALL = S("b", 10.5), S("s", 9)
H1 = S("h1", 20, True, align=1, spaceAfter=8)
H2 = S("h2", 13, True, spaceBefore=10, spaceAfter=4)
CELL, CELLB = S("c", 9.5, lead=14), S("cb", 9.5, True, lead=14)


def P(t, st=BODY):
    return Paragraph(t, st)


def tbl(rows, widths, head=True, hdr_bg="#dfe6f0"):
    data = [[P(str(c), CELLB if (head and i == 0) else CELL) for c in r] for i, r in enumerate(rows)]
    t = Table(data, colWidths=[w * mm for w in widths], repeatRows=1 if head else 0)
    st = [("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#555555")),
          ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
          ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4)]
    if head:
        st.append(("BACKGROUND", (0, 0), (-1, 0), colors.HexColor(hdr_bg)))
    t.setStyle(TableStyle(st))
    return t


def build_pdf(name, story, footer_note=SCHOOL):
    def deco(c, d):
        w, h = A4
        c.saveState()
        c.setFont("NSK-B", 8.5)
        c.setFillColor(colors.HexColor("#b00020"))
        c.drawString(20 * mm, h - 12 * mm, NOTICE)
        c.setFillColor(colors.HexColor("#444444"))
        c.setFont("NSK", 8.5)
        c.drawString(20 * mm, 10 * mm, f"{footer_note}  |  {NOTICE}")
        c.drawRightString(w - 20 * mm, 10 * mm, f"- {d.page} -")
        c.restoreState()
    doc = BaseDocTemplate(os.path.join(OUT, name), pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm,
                          topMargin=20 * mm, bottomMargin=18 * mm, title=name.rsplit(".", 1)[0],
                          author=f"{SCHOOL} (가상)")
    doc.addPageTemplates([PageTemplate(id="p", frames=[Frame(doc.leftMargin, doc.bottomMargin,
                          doc.width, doc.height, id="f")], onPage=deco)])
    doc.build(story)


# --------------------------------------------------------------- DOCX helpers
def _fonts(rpr):
    rf = rpr.find(qn("w:rFonts"))
    if rf is None:
        rf = OxmlElement("w:rFonts")
        rpr.insert(0, rf)
    for a in ("w:ascii", "w:hAnsi", "w:eastAsia", "w:cs"):
        rf.set(qn(a), FONT)


def set_font(run, size=None, bold=None, color=None):
    run.font.name = FONT
    _fonts(run._element.get_or_add_rPr())
    if size:
        run.font.size = Pt(size)
    if bold is not None:
        run.font.bold = bold
    if color:
        run.font.color.rgb = RGBColor.from_string(color)


def new_doc(header_text):
    d = Document()
    sec = d.sections[0]
    sec.left_margin = sec.right_margin = Cm(2.2)
    sec.top_margin = Cm(2.2)
    sec.bottom_margin = Cm(2)
    st = d.styles["Normal"]
    st.font.name = FONT
    st.font.size = Pt(10.5)
    _fonts(st.element.get_or_add_rPr())
    set_font(sec.header.paragraphs[0].add_run(f"{header_text}  |  {NOTICE}"), 8.5, True, "B00020")
    fp = sec.footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_font(fp.add_run(f"{SCHOOL}  |  {NOTICE}"), 8.5, color="444444")
    return d


def para(d, text, size=10.5, bold=False, align=None, color=None, after=4):
    p = d.add_paragraph()
    set_font(p.add_run(text), size, bold, color)
    if align == "c":
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    if align == "r":
        p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p.paragraph_format.space_after = Pt(after)
    return p


def shade(cell, hexcol):
    sh = OxmlElement("w:shd")
    sh.set(qn("w:val"), "clear")
    sh.set(qn("w:fill"), hexcol)
    cell._element.get_or_add_tcPr().append(sh)


def dtable(d, rows, widths=None):
    t = d.add_table(rows=len(rows), cols=len(rows[0]))
    t.style = "Table Grid"
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, row in enumerate(rows):
        for j, v in enumerate(row):
            c = t.cell(i, j)
            c.text = ""
            set_font(c.paragraphs[0].add_run(str(v)), 9.5, i == 0)
            if i == 0:
                shade(c, "DFE6F0")
            if widths:
                c.width = Cm(widths[j])
    d.add_paragraph().paragraph_format.space_after = Pt(2)
    return t


# ============================================================ 01 공문 (PDF)
def f01():
    s = [P("공 문 (가상)", H1), P(f"<b>{SCHOOL}</b>", S("x", 12, align=1)), Spacer(1, 6)]
    s.append(tbl([["문서번호", "한빛고-2026-1187", "시행일자", "2026. 11. 25.(수)"],
                  ["수신", "각 부서장, 각 학년 부장", "발신", f"{SCHOOL} 교무기획부"],
                  ["제목", "2026학년도 2학기 말 교무·학사 업무 제출 안내", "연락처", f"교무기획부 {PHONE}"]],
                 [22, 62, 22, 64], head=False))
    s += [Spacer(1, 6),
          P("1. 관련: 2026학년도 학사 운영 계획 및 학업성적관리규정(제5조, 제9조)."),
          P("2. 2학기 말 학사 마무리를 위하여 아래와 같이 업무 자료를 제출하여 주시기 바랍니다."),
          P("3. 제출 기한 및 내용", H2),
          tbl([["연번", "제출 내용", "제출 대상", "제출 기한", "제출 방법"],
               ["1", "2학기 수행평가 결과(학급별 성적 일람표) 입력 및 확인서", "교과 담당교사", "2026. 12. 4.(금) 16:00까지", "교무행정시스템 입력 후 확인서 제출"],
               ["2", "2027학년도 교육과정 편성 희망 조사서(과목·시수)", "교과협의회 대표", "2026. 12. 9.(수) 12:00까지", "교무기획부 공용 폴더 업로드"],
               ["3", "학년말 생활기록부 점검 결과 보고서", "담임교사", "2026. 12. 15.(화) 17:00까지", "공문 회신(문서 1부)"]],
              [12, 56, 28, 40, 34]),
          Spacer(1, 6), P("4. 유의 사항", H2),
          P("&nbsp;&nbsp;가. 제출 기한을 지키지 못할 경우 사유서를 교무부장에게 사전 제출하여야 합니다."),
          P("&nbsp;&nbsp;나. 제출 서식은 교무기획부 공용 폴더(2026-2학기말)에서 내려받을 수 있습니다."),
          P("&nbsp;&nbsp;다. 학생 개인정보가 포함된 파일은 암호화하여 제출하고 외부 서비스에 업로드하지 않습니다."),
          PageBreak(),
          P("붙임 1. 제출 서식 및 작성 요령(요약)", H2),
          tbl([["서식", "작성 요령", "비고"],
               ["수행평가 결과 확인서", "평가 영역별 점수 입력 후 교과 담당교사 서명", "점수 수정은 12. 4. 이전만 가능"],
               ["교육과정 편성 희망 조사서", "과목명, 학년, 주당 시수, 개설 희망 사유 기재", "신설 과목은 근거 첨부"],
               ["생활기록부 점검 보고서", "누락·오기 항목 목록과 조치 결과", "점검표 양식 사용"]],
              [45, 80, 45]),
          Spacer(1, 14), P("붙임 2. 문의처", H2),
          P(f"교무기획부(담당교사) {PHONE}"), Spacer(1, 24),
          P(f"<b>{SCHOOL}장</b>", S("k", 14, align=1)), Spacer(1, 10),
          P("담당교사 / 교무부장 / 교감 / 교장 &nbsp;&nbsp; 시행 한빛고-2026-1187(2026. 11. 25.)", SMALL),
          P(f"우 00000 가상시 가상구 가상로 0 / 전화 {PHONE} / 전송 {PHONE}", SMALL),
          P(NOTICE, S("n", 10, True))]
    build_pdf("01_공문_가상.pdf", s)


# ============================================================ 02 평가계획서
def f02():
    d = new_doc("2026학년도 2학기 통합사회 평가계획서")
    para(d, "2026학년도 2학기 통합사회 평가 계획서", 18, True, "c", after=2)
    para(d, f"{SCHOOL} 1학년 사회과 · 담당 교과교사 · 문의 {PHONE}", 10, align="c")
    para(d, NOTICE, 10, True, "c", "B00020", after=8)
    para(d, "1. 평가 기본 방향", 12, True)
    para(d, "가. 2022 개정 교육과정 통합사회 성취기준에 근거하여 학습 과정 중심으로 평가한다.")
    para(d, "나. 수행평가는 2회 실시하며, 평가 기준과 일정은 사전에 학생·학부모에게 안내한다.")
    para(d, "다. 정기고사와 수행평가의 반영 비율은 학업성적관리규정을 따른다.")
    para(d, "2. 평가 종류별 반영 비율", 12, True)
    dtable(d, [["구분", "평가 종류", "반영 비율", "만점"],
               ["정기고사", "2학기 기말고사(지필)", "40%", "100점"],
               ["수행평가", "1회 모둠 탐구 보고서", "30%", "30점"],
               ["수행평가", "2회 토론 및 발표", "30%", "30점"],
               ["합계", "", "100%", ""]], [3, 7, 3, 3])
    para(d, "3. 수행평가 세부 계획", 12, True)
    dtable(d, [["회차", "영역·내용", "실시 일정", "제출·평가 방법", "반영 비율"],
               ["1회", "기후변화와 지속가능한 생활 모둠 탐구 보고서", "2026. 10. 14.(수) ~ 10. 28.(수), 제출 10. 28.", "보고서 1부 제출, 루브릭 평가(4개 기준)", "30%"],
               ["2회", "인권 보장 사례 토론 및 5분 발표", "2026. 12. 2.(수) ~ 12. 3.(목) 수업 시간", "발표 및 동료 평가, 루브릭 평가", "30%"]],
          [1.5, 5.5, 4.5, 4, 1.5])
    para(d, "4. 기말고사 시험 범위 (학생 안내용)", 12, True)
    dtable(d, [["단원", "범위", "비고"],
               ["Ⅰ", "인간, 사회, 환경과 행복", "교과서 12~35쪽"],
               ["Ⅱ", "자연환경과 인간(기후와 인간 생활)", "교과서 38~61쪽, 학습지 1~5"],
               ["Ⅲ", "생활 공간과 사회", "교과서 62~83쪽"]], [2.5, 9, 5])
    para(d, "※ 시험 일시: 2026. 12. 17.(목) ~ 12. 18.(금), 통합사회는 12. 17. 2교시 (가상).", 10)
    para(d, "5. 유의 사항", 12, True)
    para(d, "가. 수행평가 미제출 시 해당 영역은 최저 점수를 부여하되, 인정 결석은 대체 평가를 실시한다.")
    para(d, "나. 평가 결과 이의 신청은 결과 공개 후 3일 이내 교과교사에게 서면으로 한다.")
    para(d, f"다. 문의: 교무기획부 {PHONE}")
    d.save(os.path.join(OUT, "02_평가계획서_가상.docx"))


# ============================================================ 03 가정통신문
def f03():
    d = new_doc("2026학년도 가정통신문 제2026-41호")
    para(d, SCHOOL, 20, True, "c", after=0)
    para(d, "가 정 통 신 문", 16, True, "c", after=2)
    para(d, NOTICE, 10, True, "c", "B00020", after=8)
    para(d, "2026. 11. 30.(월)    제목: 2026학년도 종업식 및 겨울방학 안내", 11, True)
    para(d, "학부모님 안녕하십니까? 한 해 동안 학교 교육활동에 보내 주신 협조에 깊이 감사드립니다. "
            "2026학년도 2학기를 마무리하며 종업식과 겨울방학 일정을 아래와 같이 안내하오니 참고하여 주시기 바랍니다.")
    para(d, "- 아 래 -", 11, True, "c")
    dtable(d, [["항목", "내용"],
               ["종업식", "2026. 12. 23.(수) 3교시, 각 교실에서 방송으로 진행"],
               ["겨울방학", "2026. 12. 24.(목) ~ 2027. 2. 7.(일)"],
               ["성적 통지", "2026. 12. 23.(수) 학교 알림장 앱으로 개별 안내"],
               ["방학 중 문의", f"교무실 {PHONE} (평일 09:00~16:00)"]], [3.5, 12])
    para(d, "※ 방학 중 안전사고 예방을 위해 가정에서도 지도 부탁드립니다.")
    para(d, f"2026. 11. 30.\n{SCHOOL}장", 12, True, "c")
    d.save(os.path.join(OUT, "03_가정통신문_예시1.docx"))

    d = new_doc("2026학년도 가정통신문 제2026-47호")
    para(d, f"{SCHOOL} 가정통신문", 18, True, after=0)
    para(d, NOTICE, 10, True, None, "B00020", after=6)
    para(d, "제목: 겨울방학 방과후 돌봄·학습 프로그램 참여 신청 안내", 13, True)
    para(d, "안녕하세요, 학부모님. 어느새 한 해의 끝이 다가왔습니다.\n"
            "겨울방학에도 학교에서 아이들이 안전하게 배우고 쉴 수 있도록 방과후 프로그램을 준비했습니다. "
            "관심 있으신 분은 아래 신청서를 12월 11일(금)까지 담임교사에게 보내 주세요.")
    para(d, "운영 안내", 11.5, True)
    dtable(d, [["프로그램", "시간", "대상", "비용"],
               ["독서·토론 교실", "월·수 10:00~12:00", "1~2학년 희망자", "무료"],
               ["수학 기초 다지기", "화·목 10:00~12:00", "1학년 희망자", "무료"],
               ["돌봄 교실(자율학습)", "평일 09:00~16:00", "1~2학년 희망자", "점심 개별"]], [4.5, 4.5, 4, 3])
    para(d, f"문의: 교무실 {PHONE} 으로 편하게 연락 주세요.")
    para(d, "- - - - - - - - 절 취 선 - - - - - - - -", 9, align="c")
    para(d, "프로그램 신청서  (가상 서식)", 12, True)
    dtable(d, [["신청 프로그램", "학년·반", "보호자 확인"], ["", "", "(서명)"]], [6, 4, 5])
    para(d, f"{SCHOOL}장", 12, True, "r")
    d.save(os.path.join(OUT, "03_가정통신문_예시2.docx"))


# ============================================================ 04 현장체험계획서
def f04():
    d = new_doc("2026학년도 1학년 현장체험학습 계획서")
    para(d, "2026학년도 1학년 현장체험학습 계획서", 18, True, "c", after=2)
    para(d, f"{SCHOOL} 1학년부 · 문의 {PHONE}", 10, align="c")
    para(d, NOTICE, 10, True, "c", "B00020", after=8)
    para(d, "1. 개요", 12, True)
    dtable(d, [["항목", "내용"],
               ["행사명", "1학년 생태·역사 문화 현장체험학습 (통합사회 연계)"],
               ["일시", "2026. 12. 11.(금) 08:30 ~ 16:30"],
               ["집합 시각·장소", "08:30까지 운동장 집합 (본관 앞), 08:50 버스 출발"],
               ["장소", "가상시 가상생태공원 및 가상역사박물관"],
               ["대상·인원", "1학년 6학급 156명 (가상 인원, 학생 정보 없음)"],
               ["인솔", "담임교사 6명, 부장교사 1명, 보건교사 1명"]], [3.5, 12.5])
    para(d, "2. 세부 일정", 12, True)
    dtable(d, [["시간", "활동", "비고"],
               ["08:00~08:20", "교실 집합, 출석 확인, 안전 교육", "집합 시각: 08:00까지 교실 집합"],
               ["08:50", "학교 출발 (버스 4대)", "담임교사 동승"],
               ["09:40~11:30", "가상생태공원 탐방 및 모둠 활동", "활동지 배부"],
               ["11:30~12:30", "점심 (도시락)", "알레르기 확인"],
               ["13:00~15:00", "가상역사박물관 관람", "해설 프로그램 포함"],
               ["15:10", "학교 복귀 출발", "16:30 해산"]], [3.2, 7, 6])
    para(d, "3. 예산", 12, True)
    dtable(d, [["항목", "산출 내역", "금액(원)"],
               ["버스 임차", "4대 × 380,000원", "1,520,000"],
               ["입장료·체험비", "156명 × 4,500원", "702,000"],
               ["보험료", "156명 × 700원", "109,200"],
               ["합계", "", "2,331,200"]], [4, 8, 4])
    para(d, "4. 안전 대책", 12, True)
    for t in ["가. 출발 전 안전 교육(교통·응급 대응)을 실시하고 학급별 비상연락망을 확인한다.",
              "나. 버스 탑승 시 좌석 벨트 착용, 학급별 인원 점검(승·하차 시 각 1회).",
              "다. 보건교사가 상비약을 휴대하며, 응급 시 인근 병원으로 이송한다.",
              f"라. 비상 연락: 교무실 {PHONE}, 행사 당일 1학년부 {PHONE}"]:
        para(d, t)
    para(d, "5. 기타 안내", 12, True)
    para(d, "학부모님께는 가정통신문으로 별도 안내하며, 학생은 12월 11일 오전 8시 30분까지 운동장에 집합한다. "
            "복장은 활동하기 편한 체육복, 준비물은 도시락·물·활동지 필기구이다.")
    d.save(os.path.join(OUT, "04_현장체험계획서_가상.docx"))


# ============================================================ 05 수업슬라이드/학습지
def pset(run, size, bold=False, color="222222"):
    run.font.size = PPt(size)
    run.font.bold = bold
    run.font.color.rgb = PRGB.from_string(color)
    run.font.name = FONT
    rpr = run._r.get_or_add_rPr()
    for tag in ("a:ea", "a:cs"):
        rpr.append(rpr.makeelement(qn(tag), {"typeface": FONT}))


def f05_pptx():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank = prs.slide_layouts[6]

    def slide(title, bullets):
        s = prs.slides.add_slide(blank)
        bar = s.shapes.add_textbox(Inches(0), Inches(0), Inches(13.333), Inches(1.1))
        bar.fill.solid()
        bar.fill.fore_color.rgb = PRGB(0x1F, 0x3A, 0x5F)
        tf = bar.text_frame
        tf.word_wrap = True
        r = tf.paragraphs[0].add_run()
        r.text = title
        pset(r, 28, True, "FFFFFF")
        box = s.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(11.7), Inches(4.8))
        tf = box.text_frame
        tf.word_wrap = True
        for i, b in enumerate(bullets):
            p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
            r = p.add_run()
            r.text = b
            pset(r, 22)
            p.space_after = PPt(10)
        ft = s.shapes.add_textbox(Inches(0.8), Inches(6.8), Inches(11.7), Inches(0.5))
        r = ft.text_frame.paragraphs[0].add_run()
        r.text = f"{SCHOOL} · 통합사회 · {NOTICE}"
        pset(r, 12, False, "B00020")

    slide("통합사회 2단원 자연환경과 인간", [f"{SCHOOL} 1학년 · 통합사회", "2026학년도 2학기 · 담당 교과교사", NOTICE])
    slide("학습 목표", ["기후가 인간의 생활 양식에 미치는 영향을 설명한다.", "지역별 기후 환경에 따른 의식주 차이를 비교한다.", "기후변화가 인간 생활에 주는 영향을 사례로 분석한다."])
    slide("핵심 개념 1: 기후 요인과 기후 지역", ["기후 요인: 위도, 해발 고도, 해류, 지형, 수륙 분포", "기후 지역: 열대, 온대, 건조, 냉대, 한대 기후", "같은 위도라도 해발 고도와 해류에 따라 기후가 다르다."])
    slide("핵심 개념 2: 기후와 의식주", ["열대: 얇고 통풍이 잘 되는 옷, 고상 가옥", "건조: 온몸을 감싸는 옷, 두꺼운 흙벽 가옥", "냉대·한대: 두꺼운 옷, 열 손실을 줄이는 가옥 구조", "의식주는 자연환경에 적응한 결과이다."])
    slide("핵심 개념 3: 기후변화와 인간 생활", ["온실가스 증가 → 지구 평균 기온 상승", "해수면 상승, 폭염·집중호우 등 극단적 기상 현상 증가", "농업, 보건, 주거 등 생활 전반에 영향", "대응: 온실가스 감축(탄소중립), 기후 변화 적응"])
    slide("모둠 활동", ["모둠별로 기후 지역 1곳을 선택하고 의식주 특징을 조사한다.", "기후변화로 달라질 수 있는 점 1가지를 예측해 발표한다.", "활동지: 05_통합사회2단원_학습지.pdf"])
    slide("정리 및 형성평가", ["핵심 용어: 기후 요인, 기후 지역, 온실가스, 탄소중립", "형성평가 5문항(학습지 5쪽)", "다음 시간: 생활 공간과 사회"])
    prs.save(os.path.join(OUT, "05_통합사회2단원_수업슬라이드.pptx"))


def f05_pdf():
    s = [P("통합사회 2단원 학습지", H1), P(f"{SCHOOL} 1학년 · 자연환경과 인간", S("x", 11, align=1)),
         P("학년·반·번호: ______ &nbsp;&nbsp; 이름: ________ (공란)"), Spacer(1, 6),
         P("1. 학습 안내", H2), P("이 학습지는 연수용 가상 자료입니다. 단원 학습 목표: 기후가 인간 생활에 미치는 영향을 이해한다."),
         tbl([["핵심 개념", "한 줄 설명"],
              ["기후 요인", "위도, 해발 고도, 해류, 지형, 수륙 분포 등 기후에 영향을 주는 요소"],
              ["기후 지역", "기온과 강수량 특징에 따라 나눈 지역(열대·건조·온대·냉대·한대)"]], [40, 130]),
         PageBreak(),
         P("2. 기후 요인과 기후 지역", H2),
         P("기후는 일정 기간 한 지역에서 나타나는 평균적인 대기 상태이다. 위도가 낮을수록 태양 에너지를 많이 받아 기온이 높다. "
           "해발 고도가 100m 높아질 때마다 기온은 대략 0.65도씩 낮아진다."),
         tbl([["기후 지역", "특징", "대표 생활 모습"], ["열대", "연중 기온이 높고 강수량이 많음", "고상 가옥, 얇은 옷"],
              ["건조", "강수량이 적고 일교차가 큼", "흙벽 가옥, 온몸 감싸는 옷"], ["온대", "사계절이 나타남", "계절별 의복, 다양한 농업"]], [30, 70, 70]),
         Spacer(1, 6), P("<b>문제 1.</b> 위도가 같아도 지역 기후가 다른 이유를 한 가지 쓰시오. ____________________"),
         PageBreak(),
         P("3. 기후와 의식주", H2),
         P("사람들은 기후에 적응하며 의식주 문화를 만들어 왔다. 아래 표의 빈칸을 채우시오."),
         tbl([["기후 지역", "의(옷)", "식(음식)", "주(집)"], ["열대", "", "", "고상 가옥"], ["건조", "", "", ""], ["냉대·한대", "", "", ""]], [35, 45, 45, 45]),
         Spacer(1, 6), P("<b>문제 2.</b> 열대 지역에서 고상 가옥이 발달한 까닭을 쓰시오. ____________________"),
         PageBreak(),
         P("4. 기후변화와 인간 생활", H2),
         P("화석연료 사용이 늘면서 대기 중 온실가스가 증가하였고, 지구 평균 기온이 상승하고 있다. 이에 대응하여 온실가스 배출량을 줄이고 "
           "흡수량을 늘려 순배출량을 0으로 만드는 탄소중립이 강조된다."),
         tbl([["영향 분야", "나타나는 변화(예)"], ["농업", "작물 재배 적지 이동"], ["보건", "폭염 질환 증가"], ["주거", "집중호우 침수 피해 증가"]], [40, 130]),
         Spacer(1, 6), P("<b>문제 3.</b> 탄소중립이란 무엇인지 자신의 말로 쓰시오. ____________________"),
         PageBreak(),
         P("5. 형성평가", H2),
         tbl([["번호", "문항", "답"],
              ["1", "기후에 영향을 주는 요인 두 가지를 쓰시오.", ""],
              ["2", "건조 기후 지역의 일교차가 큰 까닭은?", ""],
              ["3", "온실가스의 예를 한 가지 쓰시오.", ""],
              ["4", "고도가 높아지면 기온은 어떻게 변하는가?", ""],
              ["5", "기후변화에 대한 적응 방안을 한 가지 쓰시오.", ""]], [15, 120, 35]),
         Spacer(1, 10), P(f"정답 확인은 수업 시간에 교과교사와 함께 합니다. 문의: 사회과 {PHONE}", SMALL)]
    build_pdf("05_통합사회2단원_학습지.pdf", s)


# ============================================================ 06 PDFs
def f06():
    s = [P("2026학년도 교육과정 편성표", H1),
         P(f"{SCHOOL} · 2022 개정 교육과정 · 문의 {PHONE}", S("x", 10, align=1)), Spacer(1, 4),
         P("1. 학년별 교과(군) 편성", H2),
         tbl([["교과(군)", "과목", "1학년", "2학년", "3학년", "비고"],
              ["국어", "공통국어1·2, 화법과 언어 등", "8", "6", "4", "선택 포함"],
              ["수학", "공통수학1·2, 대수 등", "8", "6", "4", ""],
              ["영어", "공통영어1·2, 영어Ⅰ 등", "8", "6", "4", ""],
              ["사회", "통합사회1·2, 한국사1·2", "10", "4", "4", "통합사회 1학년"],
              ["과학", "통합과학1·2, 과학탐구실험1·2", "10", "4", "4", ""],
              ["체육·예술", "체육, 음악, 미술", "8", "6", "4", ""],
              ["기술·가정/정보", "기술·가정, 정보", "4", "2", "2", ""],
              ["창의적 체험활동", "자율·동아리·진로", "6", "6", "6", ""],
              ["합계(단위, 가상)", "", "62", "40", "32", ""]],
             [30, 52, 20, 20, 20, 28]),
         P("2. 편성 운영 지침", H2),
         P("가. 학기당 이수 과목 수는 8개 이내로 편성한다(제3조)."),
         P("나. 3학년 선택과목은 수요 조사 결과 신청 학생이 10명 이상인 경우 개설한다."),
         P("다. 소인수 선택과목은 교과 협의를 거쳐 공동 교육과정 또는 온라인 학교로 운영할 수 있다."),
         P("라. 학교 자율 시간은 1학년 주당 1시간, 진로 연계 프로젝트로 운영한다."),
         P("마. 3학년 선택과목 개설 조건은 위 나항에 따른다."),
         PageBreak(),
         P("3. 2026학년도 2학기 3학년 선택과목 개설 현황 (가상)", H2),
         tbl([["과목", "신청 인원(가상)", "개설 여부", "비고"], ["사회문제 탐구", "24", "개설", ""], ["생활과 과학", "18", "개설", ""],
              ["고전 읽기", "7", "미개설", "10명 미만"], ["확률과 통계", "31", "개설", "2개 반"]], [50, 40, 30, 50]),
         Spacer(1, 10), P(f"작성: 교무기획부 / 확인: 교무부장 / {SCHOOL}장 &nbsp;&nbsp; {NOTICE}", SMALL)]
    build_pdf("06_교육과정편성표_가상.pdf", s, f"{SCHOOL} 교육과정 편성표")

    arts = [("제1조(목적)", "이 규정은 한빛고등학교의 학생 학업성적 관리에 관하여 필요한 사항을 정함을 목적으로 한다."),
            ("제2조(적용 범위)", "이 규정은 본교에 재학하는 모든 학생의 평가·성적 처리·보고에 적용한다."),
            ("제3조(평가 종류)", "학업성적 평가는 정기고사와 수행평가로 구분한다."),
            ("제4조(평가 계획 공개)", "교과 담당교사는 학기 초 평가 계획을 학생·학부모에게 안내한다. 계획에는 평가 영역, 일정, 반영 비율, 채점 기준이 포함된다."),
            ("제5조(수행평가 반영 비율)", "수행평가의 반영 비율은 해당 교과 평가 총점의 30% 이상 60% 이하로 한다. 단, 실기 중심 교과는 교과협의회 심의를 거쳐 따로 정할 수 있다."),
            ("제6조(수행평가 횟수)", "교과별 수행평가는 학기당 2회 이상 실시한다."),
            ("제7조(결시자 처리)", "질병·사고 등 인정 사유가 있는 결시 학생에게는 대체 평가 기회를 부여한다. 인정 사유는 증빙 서류로 확인한다."),
            ("제8조(이의 신청)", "학생과 학부모는 성적 공개 후 3일 이내에 서면으로 이의를 신청할 수 있다. 학교는 7일 이내 결과를 통보한다."),
            ("제9조(성적 처리 기한)", "학기말 성적은 학기 종료 5일 전까지 입력을 완료하고 확인서를 제출한다."),
            ("제10조(성적관리위원회)", "성적 관리의 공정성을 위해 교무부장을 위원장으로 하는 학업성적관리위원회를 둔다."),
            ("제11조(보안)", "평가 문항, 학생 성적 등 개인정보는 암호화하여 관리하며 외부 서비스에 업로드하지 않는다."),
            ("제12조(시행)", "이 규정은 2026년 3월 1일부터 시행한다.")]
    s = [P("학업성적관리규정", H1), P(f"{SCHOOL} · 시행 2026. 3. 1. · 문의 {PHONE}", S("x", 10, align=1)), Spacer(1, 8)]
    for i, (t, b) in enumerate(arts):
        s += [P(t, S("t", 11.5, True, spaceBefore=8)), P(b)]
        if i == 5:
            s.append(PageBreak())
    s += [Spacer(1, 12), P("부칙: 이 규정은 학교운영위원회 심의를 거쳐 확정한다(가상).", SMALL), P(NOTICE, S("n", 10, True))]
    build_pdf("06_학업성적관리규정_가상.pdf", s, f"{SCHOOL} 학업성적관리규정")


# ============================================================ 07 txt, 08 docx
def f07():
    t = f"""[{NOTICE}]
{SCHOOL} 과학의 날 행사 포스터 문구

행사명: 2026 한빛 과학의 날
부제: 궁금해! 과학, 우리 손으로 풀어요
일시: 2026년 4월 21일(화) 5~7교시
장소: 한빛고등학교 본관 1층 로비와 과학실
참여: 전교생 자유 참여 (학급 단위 부스 운영)

프로그램
 - 과학 실험 체험 부스 (화학·물리·생명·지구)
 - 학생 탐구 포스터 전시
 - 과학 퀴즈 대회 (5교시)
 - 과학 골든벨 (7교시)

문의: 과학과 교무실 {PHONE}
준비물: 실험복(과학실 대여), 필기구
슬로건 후보: "호기심이 실험이 되는 날" / "한빛, 과학으로 빛나다"
"""
    with open(os.path.join(OUT, "07_과학의날_포스터문구.txt"), "w", encoding="utf-8") as f:
        f.write(t)


def f08():
    d = new_doc("기후변화 읽기자료")
    para(d, "기후변화 읽기자료 (통합사회·통합과학 연계)", 18, True, "c", after=2)
    para(d, f"{SCHOOL} · 문의 {PHONE}", 10, align="c")
    para(d, NOTICE, 10, True, "c", "B00020", after=10)
    para(d, "읽기 지문", 12, True)
    para(d, "화석연료 연소 과정에서 배출되는 온실가스가 대기 중 누적됨에 따라 지표의 복사 평형이 교란되었으며, "
            "이에 대응하기 위한 탄소중립 전략이 요구된다.", 12)
    para(d, "※ 연수용으로 직접 쓴 예시 문단입니다. 핵심 용어: 온실가스, 탄소중립.", 9.5, color="555555")
    d.save(os.path.join(OUT, "08_기후변화_읽기자료.docx"))


README = f"""# fixtures — 가상 자료

모든 파일에 "{NOTICE}", 가상 학교명 '{SCHOOL}', 전화 `{PHONE}`가 들어 있다. 실제 인물·학생 정보 없음. `python3 -I scripts/make_fixtures.py`로 재생성한다.

| 파일 | 용도 |
| --- | --- |
| `01_공문_가상.pdf` (1~2쪽, 제출 기한 3건) | IMG-21 |
| `02_평가계획서_가상.docx` (수행평가 2회 일정·반영비율) | IMG-15a, IMG-12 |
| `03_가정통신문_예시1.docx`, `03_가정통신문_예시2.docx` | IMG-12, IMG-15b |
| `04_현장체험계획서_가상.docx` (일시·장소·예산·안전, 집합 시각 2개 기재) | VID-02 |
| `05_통합사회2단원_수업슬라이드.pptx`, `05_통합사회2단원_학습지.pdf` (각 5쪽+) | IMG-20 |
| `06_교육과정편성표_가상.pdf`, `06_학업성적관리규정_가상.pdf` (조항 5개+) | IMG-26 |
| `07_과학의날_포스터문구.txt` | IMG-15c |
| `08_기후변화_읽기자료.docx` (강의안의 원문 문단) | IMG-24 |
"""

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for fn in (f01, f02, f03, f04, f05_pptx, f05_pdf, f06, f07, f08):
        fn()
    with open(os.path.join(OUT, "README.md"), "w", encoding="utf-8") as f:
        f.write(README)
    print("done")
