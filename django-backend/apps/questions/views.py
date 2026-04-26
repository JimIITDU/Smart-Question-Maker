# from rest_framework import generics, status, permissions, viewsets
# from rest_framework.decorators import action
# from rest_framework.response import Response
# from .models import QuestionSession, Question
# from .serializers import QuestionSessionSerializer, QuestionSerializer, GenerateQuestionsSerializer
# from .generators import QuestionGenerator
# # from .helpers import generate_pdf_report
# from apps.documents.models import Document
# from apps.documents.processors import DocumentProcessor
# import json
# from django.http import HttpResponse
# import csv
# from datetime import datetime
# from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
# from reportlab.lib.styles import getSampleStyleSheet
# from reportlab.lib.units import inch
# from io import BytesIO
# # from django.core.files.base import FileResponse


# class QuestionSessionViewSet(viewsets.ModelViewSet):
#     """ViewSet for managing Question Sessions."""
#     serializer_class = QuestionSessionSerializer
#     permission_classes = [permissions.IsAuthenticated]
    
#     def get_queryset(self):
#         return QuestionSession.objects.filter(user=self.request.user)
    
#     def perform_create(self, serializer):
#         """Override to automatically set the user."""
#         serializer.save(user=self.request.user)
    
#     @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
#     def generate(self, request):
#         """
#         Generate questions for a document.
#         POST /api/questions/sessions/generate/
#         """
#         serializer = GenerateQuestionsSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         data = serializer.validated_data

#         try:
#             document = Document.objects.get(id=data['document_id'], user=request.user)
#         except Document.DoesNotExist:
#             return Response(
#                 {'error': 'Document not found.'}, 
#                 status=status.HTTP_404_NOT_FOUND
#             )
        
#         # If document not yet processed, process it synchronously
#         if document.status != 'completed':
#             if document.status == 'failed':
#                 return Response(
#                     {'error': f'Document processing failed: {document.extracted_text}'}, 
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             try:
#                 # Process document synchronously
#                 processor = DocumentProcessor()
#                 extracted_text = processor.process_document(document)
                
#                 # If processing was successful, update status
#                 if document.status == 'completed' and extracted_text:
#                     # Try to create vector store for semantic search
#                     try:
#                         store_id = processor.create_vector_store(document.id, extracted_text)
#                         document.vector_store_id = store_id
#                         document.save()
#                     except Exception as e:
#                         # Vector store creation is optional, don't fail if it errors
#                         pass
#                 else:
#                     return Response(
#                         {'error': f'Failed to process document: {extracted_text}'}, 
#                         status=status.HTTP_400_BAD_REQUEST
#                     )
#             except Exception as e:
#                 return Response(
#                     {'error': f'Error processing document: {str(e)}'}, 
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#         session = QuestionSession.objects.create(user=request.user, document=document)
#         generator = QuestionGenerator()

#         if data.get('include_mcq', True):
#             mcqs = generator.generate_mcq(
#                 document, 
#                 data.get('num_mcq', 5), 
#                 data.get('difficulty', 'medium')
#             )
#             for q in mcqs:
#                 Question.objects.create(
#                     session=session, 
#                     question_type='mcq',
#                     question_text=q['question'], 
#                     options=q.get('options'),
#                     correct_answer=q.get('correct_answer', ''),
#                     explanation=q.get('explanation', ''),
#                     difficulty=q.get('difficulty', 'medium'),
#                     topic=q.get('topic', ''), 
#                     total_marks=5
#                 )

#         if data.get('include_short', True):
#             shorts = generator.generate_short_questions(
#                 document, 
#                 data.get('num_short', 5), 
#                 data.get('difficulty', 'medium')
#             )
#             for q in shorts:
#                 Question.objects.create(
#                     session=session, 
#                     question_type='short',
#                     question_text=q['question'],
#                     model_answer=q.get('model_answer', ''),
#                     difficulty=q.get('difficulty', 'medium'),
#                     total_marks=q.get('marks', 5)
#                 )

#         if data.get('include_written', False):
#             written = generator.generate_written_questions(
#                 document, 
#                 data.get('num_written', 2)
#             )
#             for q in written:
#                 Question.objects.create(
#                     session=session, 
#                     question_type='written',
#                     question_text=q['question'],
#                     model_answer=q.get('model_answer', ''),
#                     rubric=q.get('rubric'),
#                     bloom_level=q.get('bloom_level', ''),
#                     total_marks=q.get('total_marks', 20)
#                 )

#         session.total_questions = session.questions.count()
#         session.save()
#         return Response(
#             QuestionSessionSerializer(session).data, 
#             status=status.HTTP_201_CREATED
#         )
    
#     @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
#     def save(self, request, pk=None):
#         """
#         Mark session as completed/saved.
#         POST /api/questions/sessions/{id}/save/
#         """
#         session = self.get_object()
#         session.completed = True
#         session.save()
#         return Response(
#             {'status': 'Session marked as saved', 'session_id': session.id},
#             status=status.HTTP_200_OK
#         )
    
#     @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
#     def download(self, request, pk=None):
#         """
#         Download questions from a session as JSON or CSV
#         GET /api/questions/sessions/{id}/download/?format=json|csv
#         """
#         session = self.get_object()
#         format_type = request.query_params.get('format', 'json')
        
#         questions = session.questions.all()
        
#         if format_type == 'csv':
#             response = HttpResponse(content_type='text/csv')
#             response['Content-Disposition'] = f'attachment; filename="questions_session_{session.id}.csv"'
            
#             writer = csv.writer(response)
#             writer.writerow(['Question#', 'Type', 'Question', 'Difficulty', 'Marks', 'Options/Answer', 'Explanation'])
            
#             for i, q in enumerate(questions, 1):
#                 options = json.dumps(q.options) if q.options else ''
#                 answer = q.correct_answer or q.model_answer or ''
#                 writer.writerow([
#                     i,
#                     q.question_type,
#                     q.question_text[:100],
#                     q.difficulty,
#                     q.total_marks,
#                     options,
#                     q.explanation[:100] if q.explanation else ''
#                 ])
            
#             return response
        
#         else:  # JSON format
#             data = {
#                 'session_id': session.id,
#                 'document': session.document.title,
#                 'created_at': session.created_at.isoformat(),
#                 'total_questions': questions.count(),
#                 'completed': session.completed,
#                 'questions': []
#             }
            
#             for q in questions:
#                 data['questions'].append({
#                     'id': q.id,
#                     'type': q.question_type,
#                     'question': q.question_text,
#                     'options': q.options,
#                     'correct_answer': q.correct_answer,
#                     'model_answer': q.model_answer,
#                     'explanation': q.explanation,
#                     'difficulty': q.difficulty,
#                     'marks': q.total_marks,
#                     'topic': q.topic
#                 })
            
#             response = HttpResponse(json.dumps(data, indent=2), content_type='application/json')
#             response['Content-Disposition'] = f'attachment; filename="questions_session_{session.id}.json"'
#             return response
    
#     @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
#     def preview(self, request, pk=None):
#         """
#         Preview questions in a session without downloading
#         GET /api/questions/sessions/{id}/preview/
#         """
#         session = self.get_object()
#         questions = session.questions.all()
        
#         data = {
#             'session_id': session.id,
#             'document': session.document.title,
#             'created_at': session.created_at.isoformat(),
#             'total_questions': questions.count(),
#             'completed': session.completed,
#             'questions': []
#         }
        
#         for q in questions:
#             data['questions'].append({
#                 'id': q.id,
#                 'type': q.question_type,
#                 'question': q.question_text,
#                 'options': q.options,
#                 'correct_answer': q.correct_answer,
#                 'model_answer': q.model_answer,
#                 'explanation': q.explanation,
#                 'difficulty': q.difficulty,
#                 'marks': q.total_marks,
#                 'topic': q.topic
#             })
        
#         return Response(data, status=status.HTTP_200_OK)

#     @action(detail=True, methods=['get'])
#     def download_pdf(self, request, pk=None):
#         """
#         Generate and download a PDF of the question paper.
#         GET /api/questions/sessions/{id}/download_pdf/
#         """
#         try:
#             session = self.get_object()
#             pdf_buffer = generate_pdf_report(session)
#             return FileResponse(pdf_buffer, as_attachment=True, filename=f'{session.name}_questions.pdf',
#                                 content_type='application/pdf')
#         except QuestionSession.DoesNotExist:
#             return Response({"error": "Session not found"}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"PDF generation failed for session {pk}: {e}")
#             return Response({"error": "Failed to generate PDF."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class QuestionViewSet(viewsets.ReadOnlyModelViewSet):
#     """ViewSet for viewing Questions (read-only)."""
#     serializer_class = QuestionSerializer
#     permission_classes = [permissions.IsAuthenticated]
    
#     def get_queryset(self):
#         return Question.objects.filter(session__user=self.request.user)

import logging
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import QuestionSession, Question
from .serializers import QuestionSessionSerializer, QuestionSerializer, GenerateQuestionsSerializer
from .generators import QuestionGenerator
from apps.documents.models import Document
from apps.documents.processors import DocumentProcessor

logger = logging.getLogger(__name__)


class GenerateQuestionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = GenerateQuestionsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            document = Document.objects.get(id=data['document_id'], user=request.user)
        except Document.DoesNotExist:
            return Response({'error': 'Document not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Process document if still pending
        if document.status == 'pending':
            try:
                processor = DocumentProcessor()
                processor.process_document(document)
                
                # Create vector store for semantic search (optional)
                try:
                    if document.extracted_text:
                        store_id = processor.create_vector_store(document.id, document.extracted_text)
                        document.vector_store_id = store_id
                        document.save()
                except Exception as e:
                    logger.warning(f"Vector store creation failed: {str(e)}")
                    pass
            except Exception as e:
                return Response(
                    {'error': f'Failed to process document: {str(e)}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Check if document processing was successful
        if document.status == 'failed':
            return Response(
                {'error': f'Document processing failed. Please try uploading again.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if not document.extracted_text:
            return Response({'error': 'No text could be extracted from this document.'}, status=status.HTTP_400_BAD_REQUEST)

        session = QuestionSession.objects.create(user=request.user, document=document)
        generator = QuestionGenerator()
        difficulty = data.get('difficulty', 'medium')
        questions_created = 0

        if data.get('include_mcq', True):
            try:
                mcqs = generator.generate_mcq(document, data.get('num_mcq', 5), difficulty)
                logger.info(f"Generated {len(mcqs)} MCQs")
                
                if not mcqs:
                    logger.warning("No MCQs generated, trying fallback...")
                    mcqs = generator._generate_fallback_mcq(document.extracted_text, data.get('num_mcq', 5), difficulty)
                
                for q in mcqs:
                    try:
                        options = q.get('options', {})
                        # Ensure options is a proper dict
                        if not isinstance(options, dict) or not all(k in options for k in ['A', 'B', 'C', 'D']):
                            logger.warning(f"Skipping invalid MCQ options: {options}")
                            continue
                        
                        Question.objects.create(
                            session=session,
                            question_type='mcq',
                            question_text=q.get('question', ''),
                            options=options,
                            correct_answer=q.get('correct_answer', 'A').upper(),
                            explanation=q.get('explanation', ''),
                            difficulty=q.get('difficulty', difficulty),
                            topic=q.get('topic', ''),
                            total_marks=5
                        )
                        questions_created += 1
                    except Exception as e:
                        logger.error(f"Failed to create individual MCQ: {e}")
            except Exception as e:
                logger.error(f"MCQ generation failed: {e}")

        if data.get('include_short', True):
            try:
                shorts = generator.generate_short_questions(document, data.get('num_short', 3), difficulty)
                logger.info(f"Generated {len(shorts)} short questions")
                
                if not shorts:
                    logger.warning("No short questions generated, trying fallback...")
                    shorts = generator._generate_fallback_short(document.extracted_text, data.get('num_short', 3), difficulty)
                
                for q in shorts:
                    try:
                        Question.objects.create(
                            session=session,
                            question_type='short',
                            question_text=q.get('question', ''),
                            model_answer=q.get('model_answer', ''),
                            difficulty=q.get('difficulty', difficulty),
                            total_marks=q.get('marks', 8)
                        )
                        questions_created += 1
                    except Exception as e:
                        logger.error(f"Failed to create individual short question: {e}")
            except Exception as e:
                logger.error(f"Short Q generation failed: {e}")

        if data.get('include_written', False):
            try:
                written = generator.generate_written_questions(document, data.get('num_written', 2))
                logger.info(f"Generated {len(written)} written questions")
                
                if not written:
                    logger.warning("No written questions generated, trying fallback...")
                    written = generator._generate_fallback_written(document.extracted_text, data.get('num_written', 2))
                
                for q in written:
                    try:
                        Question.objects.create(
                            session=session,
                            question_type='written',
                            question_text=q.get('question', ''),
                            model_answer=q.get('model_answer', ''),
                            rubric=q.get('rubric'),
                            bloom_level=q.get('bloom_level', ''),
                            total_marks=q.get('total_marks', 20)
                        )
                        questions_created += 1
                    except Exception as e:
                        logger.error(f"Failed to create individual written question: {e}")
            except Exception as e:
                logger.error(f"Written Q generation failed: {e}")

        session.total_questions = questions_created
        session.save()

        if questions_created == 0:
            logger.error(f"No questions created for session {session.id}")
            session.delete()
            return Response(
                {'error': 'Failed to generate any questions. The document may be too short or invalid. Please try another document.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        logger.info(f"Successfully created {questions_created} questions for session {session.id}")
        return Response(QuestionSessionSerializer(session).data, status=status.HTTP_201_CREATED)


class SessionDetailView(generics.RetrieveAPIView):
    serializer_class = QuestionSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return QuestionSession.objects.filter(user=self.request.user)


class SessionListView(generics.ListAPIView):
    """List all question sessions for the authenticated user."""
    serializer_class = QuestionSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return QuestionSession.objects.filter(user=self.request.user).order_by('-created_at')


class SessionDeleteView(generics.DestroyAPIView):
    """Delete a question session."""
    serializer_class = QuestionSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return QuestionSession.objects.filter(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        session = self.get_object()
        session_id = session.id
        session.delete()
        logger.info(f"Session {session_id} deleted by user {request.user.id}")
        return Response(
            {'message': 'Session deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )


class DownloadPDFView(generics.RetrieveAPIView):
    """Download questions as PDF."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = QuestionSessionSerializer

    def get_queryset(self):
        return QuestionSession.objects.filter(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        """Generate and download questions as PDF."""
        from django.http import FileResponse
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.lib import colors
        from io import BytesIO
        
        session = self.get_object()
        questions = session.questions.all()
        
        # Create PDF in memory
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=(8.5*inch, 11*inch),
            topMargin=0.5*inch,
            bottomMargin=0.5*inch,
            leftMargin=0.75*inch,
            rightMargin=0.75*inch
        )
        
        story = []
        styles = getSampleStyleSheet()
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            textColor=colors.HexColor('#1f2937'),
            spaceAfter=6,
            alignment=1
        )
        story.append(Paragraph('Question Paper', title_style))
        story.append(Spacer(1, 0.2*inch))
        
        # Questions
        for idx, question in enumerate(questions, 1):
            q_style = ParagraphStyle(
                'Question',
                parent=styles['Normal'],
                fontSize=11,
                textColor=colors.HexColor('#111827'),
                spaceAfter=10,
                leftIndent=10
            )
            
            q_text = f"<b>Q{idx}. {question.question_text}</b>"
            story.append(Paragraph(q_text, q_style))
            
            # MCQ options
            if question.question_type == 'mcq' and question.options:
                options = question.options
                for opt_key in ['A', 'B', 'C', 'D']:
                    if opt_key in options:
                        opt_text = f"  <b>{opt_key}.</b> {options[opt_key]}"
                        story.append(Paragraph(opt_text, styles['Normal']))
            
            story.append(Spacer(1, 0.15*inch))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        
        # Return as downloadable file
        response = FileResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="questions_session_{session.id}.pdf"'
        logger.info(f"PDF downloaded for session {session.id}")
        return response



class SubmitAnswersView(APIView):
    """Submit student answers and get results."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            session = QuestionSession.objects.get(id=pk, user=request.user)
        except QuestionSession.DoesNotExist:
            return Response({'error': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)

        answers = request.data.get('answers', {})
        if not answers:
            return Response({'error': 'No answers provided.'}, status=status.HTTP_400_BAD_REQUEST)

        results = []
        total_marks = 0
        obtained_marks = 0

        for question in session.questions.all():
            q_id = str(question.id)
            student_answer = answers.get(q_id, '')

            is_correct = False
            marks_obtained = 0

            if question.question_type == 'mcq':
                is_correct = student_answer.upper() == question.correct_answer.upper()
                marks_obtained = question.total_marks if is_correct else 0
            else:
                # Short/written — give partial marks if answered
                if student_answer.strip():
                    marks_obtained = question.total_marks // 2
                    is_correct = True

            total_marks += question.total_marks
            obtained_marks += marks_obtained

            results.append({
                'question_id': question.id,
                'question_text': question.question_text,
                'question_type': question.question_type,
                'student_answer': student_answer,
                'correct_answer': question.correct_answer if question.question_type == 'mcq' else None,
                'model_answer': question.model_answer if question.question_type != 'mcq' else None,
                'is_correct': is_correct,
                'marks_obtained': marks_obtained,
                'total_marks': question.total_marks,
                'explanation': question.explanation if question.question_type == 'mcq' else '',
            })

        percentage = (obtained_marks / total_marks * 100) if total_marks > 0 else 0

        return Response({
            'session_id': session.id,
            'total_marks': total_marks,
            'obtained_marks': obtained_marks,
            'percentage': round(percentage, 2),
            'grade': self._get_grade(percentage),
            'results': results
        }, status=status.HTTP_200_OK)

    def _get_grade(self, percentage):
        if percentage >= 80:
            return 'A+'
        elif percentage >= 70:
            return 'A'
        elif percentage >= 60:
            return 'B'
        elif percentage >= 50:
            return 'C'
        elif percentage >= 40:
            return 'D'
        else:
            return 'F'