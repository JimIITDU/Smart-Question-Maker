from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import cm
import io


def generate_results_pdf(results_data: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm
    )

    styles = getSampleStyleSheet()
    story = []

    # Custom styles
    title_style = ParagraphStyle('CustomTitle', parent=styles['Title'],
                                  fontSize=22, spaceAfter=6, textColor=colors.HexColor('#1e3a5f'))
    heading_style = ParagraphStyle('Heading', parent=styles['Heading2'],
                                    fontSize=13, spaceBefore=12, spaceAfter=4,
                                    textColor=colors.HexColor('#1e40af'))
    body_style = ParagraphStyle('Body', parent=styles['Normal'],
                                 fontSize=10, spaceAfter=4, leading=14)
    small_style = ParagraphStyle('Small', parent=styles['Normal'],
                                  fontSize=9, textColor=colors.HexColor('#6b7280'))
    correct_style = ParagraphStyle('Correct', parent=styles['Normal'],
                                    fontSize=10, textColor=colors.HexColor('#16a34a'))
    wrong_style = ParagraphStyle('Wrong', parent=styles['Normal'],
                                  fontSize=10, textColor=colors.HexColor('#dc2626'))
    feedback_style = ParagraphStyle('Feedback', parent=styles['Normal'],
                                     fontSize=9, textColor=colors.HexColor('#92400e'),
                                     backColor=colors.HexColor('#fef3c7'),
                                     leftIndent=10, rightIndent=10,
                                     spaceBefore=4, spaceAfter=4)

    # Title
    story.append(Paragraph("Exam Results Report", title_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#1e40af')))
    story.append(Spacer(1, 0.3*cm))

    # Summary Table
    grade = results_data.get('grade', 'N/A')
    score = results_data.get('overall_score', 0)
    obtained = results_data.get('marks_obtained', 0)
    total = results_data.get('total_marks', 0)

    grade_color = colors.HexColor('#16a34a') if score >= 70 else \
                  colors.HexColor('#d97706') if score >= 50 else colors.HexColor('#dc2626')

    summary_data = [
        ['Overall Score', 'Grade', 'Marks', 'Questions Answered'],
        [f"{score:.1f}%", grade, f"{obtained:.1f}/{total}",
         f"{results_data.get('answered_questions', 0)}/{results_data.get('total_questions', 0)}"]
    ]
    summary_table = Table(summary_data, colWidths=[4*cm, 3*cm, 4*cm, 4*cm])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#eff6ff')]),
        ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 1), (-1, 1), 13),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#bfdbfe')),
        ('ROWHEIGHT', (0, 0), (-1, -1), 0.8*cm),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 0.5*cm))

    # By Type breakdown
    by_type = results_data.get('by_type', {})
    if any(v.get('count', 0) > 0 for v in by_type.values()):
        story.append(Paragraph("Performance by Question Type", heading_style))
        type_data = [['Type', 'Questions', 'Avg Score']]
        for t_name, t_data in by_type.items():
            if t_data.get('count', 0) > 0:
                type_data.append([t_name.upper(), str(t_data['count']), f"{t_data['avg_score']:.1f}%"])
        type_table = Table(type_data, colWidths=[5*cm, 4*cm, 4*cm])
        type_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f0f9ff')),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e0f2fe')),
            ('ROWHEIGHT', (0, 0), (-1, -1), 0.7*cm),
        ]))
        story.append(type_table)
        story.append(Spacer(1, 0.5*cm))

    # Detailed answers
    story.append(Paragraph("Detailed Question Results", heading_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e5e7eb')))

    for i, ans in enumerate(results_data.get('answers', []), 1):
        story.append(Spacer(1, 0.3*cm))
        q_type = ans.get('question_type', '').upper()
        q_score = ans.get('score_percentage', 0)
        q_marks = ans.get('marks_obtained', 0)
        q_total = ans.get('total_marks', 0)
        q_grade = ans.get('grade', '')

        # Question header
        header_color = colors.HexColor('#dcfce7') if q_score >= 70 else \
                       colors.HexColor('#fef9c3') if q_score >= 40 else colors.HexColor('#fee2e2')
        q_data = [[f"Q{i}. [{q_type}]  Score: {q_marks}/{q_total} ({q_score:.0f}%)  Grade: {q_grade}"]]
        q_table = Table(q_data, colWidths=[15*cm])
        q_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), header_color),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(q_table)

        # Question text
        story.append(Paragraph(f"<b>Question:</b> {ans.get('question_text', '')}", body_style))

        # MCQ: show selected vs correct
        if ans.get('question_type') == 'mcq':
            selected = ans.get('selected_option', 'Not answered')
            correct = ans.get('correct_answer', '')
            is_correct = ans.get('llm_feedback', {}).get('is_correct', False)
            if is_correct:
                story.append(Paragraph(f"✓ Your Answer: Option {selected} — CORRECT", correct_style))
            else:
                story.append(Paragraph(f"✗ Your Answer: Option {selected} | Correct Answer: Option {correct}", wrong_style))
        else:
            if ans.get('answer_text'):
                story.append(Paragraph(f"<b>Your Answer:</b> {ans.get('answer_text', '')[:500]}", body_style))
            if ans.get('model_answer'):
                story.append(Paragraph(f"<b>Model Answer:</b> {ans.get('model_answer', '')[:500]}", small_style))

        # Feedback
        feedback = (ans.get('llm_feedback') or {}).get('feedback', '')
        if feedback:
            story.append(Paragraph(f"Feedback: {feedback}", feedback_style))

        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#e5e7eb')))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()