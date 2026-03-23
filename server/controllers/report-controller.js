const Report = require("../models/Report");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const Supplier = require("../models/Supplier");

exports.createReport = async (req, res) => {
    try {
        const { title, description, status, supplierId, images, createdByEmail } = req.body;

        if ((!title, !status, !supplierId, !createdByEmail)) return res.status(500);

        const report = await Report.create({
            title,
            description,
            supplierId,
            status,
            createdByEmail,
            images,
            createdAt: new Date().toISOString(),
        });

        return res.json(report);
    } catch (err) {
        console.error(`Could not create a report ${err.message}`);
        return res.status(500).json({ error: `Could not create a report ${err.message}` });
    }
};

exports.getAllBySupplierId = async (req, res) => {
    try {
        const { supplierId } = req.params;

        const report = await Report.find({ supplierId });
        console.log(report);

        return res.json(report);
    } catch (err) {
        console.error(`Could not create a report ${err.message}`);
        return res.status(500).json({ error: `Could not create a report ${err.message}` });
    }
};

exports.getReports = async (_req, res) => {
    try {
        const reports = await Report.find();
        console.log(reports);

        return res.json(reports);
    } catch (err) {
        console.error(`Could not get reports ${err.message}`);
        return res.status(500).json({ error: `Could not get reports ${err.message}` });
    }
};

exports.getReportById = async (req, res) => {
    const { id } = req.params;
    try {
        const report = await Report.findById(id);
        console.log(report);

        return res.json(report);
    } catch (err) {
        console.error(`Could not get report by id ${err.message}`);
        return res.status(500).json({ error: `Could not get report by id ${err.message}` });
    }
};

exports.updateById = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, updateNotes, supplierId, updatedByEmail } = req.body;

        const updatedReport = await Report.findByIdAndUpdate(
            id,
            {
                title,
                description,
                status,
                updateNotes,
                supplierId,
                updatedByEmail,
            },
            { new: true, runValidators: true },
        );

        if (!updatedReport) return res.status(404).json({ error: "Report not found" });

        return res.status(200).json(updatedReport);
    } catch (err) {
        console.error(`Could not update a report ${err.message}`);
        return res.status(500).json({ error: `Could not update a report ${err.message}` });
    }
};

exports.deleteById = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedReport = await Report.findByIdAndDelete(id);
        console.log(deletedReport);

        if (!deletedReport) {
            return res.status(404).json({ error: "Report not found" });
        }

        return res.status(200).json(deletedReport);
    } catch (err) {
        console.error(`Could not delete a report ${err.message}`);
        return res.status(500).json({ error: `Could not delete a report ${err.message}` });
    }
};

exports.generatePdfById = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await Report.findById(id);
        if (!report) return res.status(404).json({ error: "Report not found" });

        const supplier = await Supplier.findById(report.supplierId);
        if (!supplier) return res.status(404).json({ error: "Supplier not found" });

        const templatePath = path.join(__dirname, "../templates/report.ejs");

        const html = await ejs.renderFile(templatePath, {
            report,
            supplier,
        });

        const pdfDir = path.join(__dirname, `../uploads/reports/${report._id}/pdfs/`);
        if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

        const pdfPath = path.join(pdfDir, `report_${report._id}.pdf`);

        const browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            headless: true,
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });
        const pdf = await page.pdf({ path: pdfPath, format: "A4", printBackground: true });
        await browser.close();

        res.download(pdfPath);
        res.send(pdf);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "could not create PDF" });
    }
};
