import PDFDocument from 'pdfkit';
import Course from '../models/Course.js';
import Progress from '../models/Progress.js';
import Lesson from '../models/Lesson.js';
import User from '../models/User.js';

export class CertificateController {
    static async generateCertificate(req, res) {
        try {
            const { courseId } = req.params;
            const userId = req.user.userId;

            const course = await Course.findById(courseId);
            const user = await User.findById(userId);
            const lessons = await Lesson.find({ course_id: courseId });

            const completedCount = await Progress.countDocuments({ courseId, userId, completed: true });

            if (completedCount < lessons.length || lessons.length === 0) {
                return res.status(403).json({ error: 'Course not 100% completed yet' });
            }

            const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=certificate-${courseId}.pdf`);

            doc.pipe(res);

            doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff');
            doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#a435f0');

            doc.fillColor('#000000').fontSize(40).text('CERTIFICATE OF COMPLETION', 0, 150, { align: 'center' });
            doc.fontSize(20).text('This is proudly presented to', 0, 220, { align: 'center' });

            doc.fillColor('#a435f0').fontSize(30).text(user.name, 0, 260, { align: 'center' });

            doc.fillColor('#000000').fontSize(20).text(`For successfully completing the course`, 0, 310, { align: 'center' });
            doc.fontSize(25).text(course.title, 0, 350, { align: 'center' });

            doc.fontSize(15).text(`Date: ${new Date().toLocaleDateString()}`, 0, 420, { align: 'center' });

            doc.end();

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to generate certificate' });
        }
    }
}

export default CertificateController;
