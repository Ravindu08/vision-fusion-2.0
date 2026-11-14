import io
import hashlib
from datetime import datetime
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas


def generate_certificate_pdf(
    student_name: str,
    student_id: str,
    university: str,
    certificate_id: str,
    total_xp: int,
    issue_date: str = None
) -> bytes:
    """
    Generate an official, high-resolution IEEE Vision Fusion 2.0 digital certificate in PDF format.
    """
    if not issue_date:
        issue_date = datetime.now().strftime("%B %d, %Y")

    buffer = io.BytesIO()
    # Landscape Letter: 11 x 8.5 inches (792 x 612 pt)
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(letter),
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    story = []
    styles = getSampleStyleSheet()

    # Custom typography styles
    title_style = ParagraphStyle(
        'CertTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=30,
        leading=36,
        textColor=colors.HexColor('#00f0ff'),
        alignment=1, # Center
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'CertSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#a855f7'),
        alignment=1,
        spaceAfter=14
    )

    presented_style = ParagraphStyle(
        'CertPresented',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#94a3b8'),
        alignment=1,
        spaceAfter=10
    )

    name_style = ParagraphStyle(
        'CertName',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=colors.HexColor('#ffffff'),
        alignment=1,
        spaceAfter=12
    )

    body_style = ParagraphStyle(
        'CertBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=16,
        textColor=colors.HexColor('#cbd5e1'),
        alignment=1,
        spaceAfter=20
    )

    meta_style = ParagraphStyle(
        'CertMeta',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#00f0ff'),
        alignment=1
    )

    meta_label = ParagraphStyle(
        'CertMetaLabel',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#64748b'),
        alignment=1
    )

    story.append(Spacer(1, 25))
    story.append(Paragraph("VISION FUSION 2.0", title_style))
    story.append(Paragraph("TECH CAREER WEEK • CERTIFICATE OF ACHIEVEMENT", subtitle_style))
    story.append(Paragraph("THIS CERTIFICATE IS OFFICIALLY PRESENTED TO", presented_style))
    story.append(Paragraph(student_name.upper(), name_style))

    inst_text = f"Student ID: {student_id} • {university}" if student_id else university
    story.append(Paragraph(inst_text, presented_style))

    body_text = (
        f"for successfully participating in <b>Vision Fusion 2.0 – Tech Career Week</b>, "
        f"completing technical career sessions, excelling in knowledge challenges, "
        f"and accumulating an exceptional total of <b>{total_xp} XP</b> "
        f"surpassing the official qualification threshold."
    )
    story.append(Paragraph(body_text, body_style))
    story.append(Spacer(1, 15))

    # Signatures & Verification Table
    data = [
        [
            Paragraph("<b>IEEE IAS Student Branch Chapter</b><br/>Uva Wellassa University", meta_style),
            Paragraph(f"<b>Certificate ID: {certificate_id}</b><br/>Issued: {issue_date}", meta_style),
            Paragraph("<b>IEEE WIE Affinity Group</b><br/>Uva Wellassa University", meta_style),
        ],
        [
            Paragraph("Official Chapter Endorsement", meta_label),
            Paragraph("Tamper-Proof Digital Verification", meta_label),
            Paragraph("Affinity Group Endorsement", meta_label),
        ]
    ]

    t = Table(data, colWidths=[230, 260, 230])
    t.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t)

    # Custom background border canvas
    def draw_background(canvas_obj, document):
        canvas_obj.saveState()
        # Dark Cyber Background
        canvas_obj.setFillColor(colors.HexColor('#07090e'))
        canvas_obj.rect(0, 0, 792, 612, fill=1, stroke=0)

        # Outer Neon Border
        canvas_obj.setStrokeColor(colors.HexColor('#00f0ff'))
        canvas_obj.setLineWidth(3)
        canvas_obj.roundRect(18, 18, 792 - 36, 612 - 36, 12, stroke=1, fill=0)

        # Inner Accent Border
        canvas_obj.setStrokeColor(colors.HexColor('#a855f7'))
        canvas_obj.setLineWidth(1)
        canvas_obj.roundRect(24, 24, 792 - 48, 612 - 48, 8, stroke=1, fill=0)

        # Corner geometric cyber accents
        canvas_obj.setStrokeColor(colors.HexColor('#00f0ff'))
        canvas_obj.setLineWidth(2)
        # Top-Left
        canvas_obj.line(18, 560, 18, 594)
        canvas_obj.line(18, 594, 52, 594)
        # Top-Right
        canvas_obj.line(740, 594, 774, 594)
        canvas_obj.line(774, 594, 774, 560)
        # Bottom-Left
        canvas_obj.line(18, 52, 18, 18)
        canvas_obj.line(18, 18, 52, 18)
        # Bottom-Right
        canvas_obj.line(740, 18, 774, 18)
        canvas_obj.line(774, 18, 774, 52)

        canvas_obj.restoreState()

    doc.build(story, onFirstPage=draw_background)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

