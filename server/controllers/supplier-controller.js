const Supplier = require("../models/Supplier");
const Report = require("../models/Report");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");

exports.createSupplier = async (req, res) => {
    try {
        const { title } = req.body;
        const contactEmail = req.body.contactEmail || "";
        const phone = req.body.phone || "";
        const notes = req.body.notes || "";

        const supplier = await Supplier.create({
            title,
            contactEmail,
            phone,
            notes,
            isActive: true,
            createdAt: new Date(),
        });

        return res.json(supplier);
    } catch (err) {
        console.error(`Could not create a supplier ${err.message}`);
        return res.status(500).json({ error: `Could not create a supplier ${err.message}` });
    }
};

exports.getSupplierById = async (req, res) => {
    try {
        const { id } = req.params;

        const supplier = await Supplier.findById(id);

        if (!supplier) return res.status(404).json({ error: "Supplier not found" });

        return res.json(supplier);
    } catch (err) {
        console.error(`Could not get supplier by id ${err.message}`);
        return res.status(500).json({ error: `Could not get supplier by id ${err.message}` });
    }
};

exports.getSuppliers = async (_req, res) => {
    try {
        const suppliers = await Supplier.find();
        return res.json(suppliers);
    } catch (err) {
        console.error(`Could not get suppliers ${err.message}`);
        return res.status(500).json({ error: `Could not get suppliers ${err.message}` });
    }
};

exports.updateById = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, contactEmail, phone, notes, isActive } = req.body;

        const updatedSupplier = await Supplier.findByIdAndUpdate(
            id,
            {
                title,
                contactEmail,
                phone,
                notes,
                isActive,
            },
            { new: true, runValidators: true },
        );

        if (!updatedSupplier) return res.status(404).json({ error: "Supplier not found" });

        return res.status(200).json(updatedSupplier);
    } catch (err) {
        console.error(`Could not update a supplier ${err.message}`);
        return res.status(500).json({ error: `Could not update a supplier ${err.message}` });
    }
};

exports.generatePdfById = async (req, res) => {
    try {
        const { id } = req.params;
        const supplier = await Supplier.findById(id);
        if (!supplier) return res.status(404).json({ error: "Supplier not found" });

        const reports = await Report.find({ supplierId: id });
        
        const templatePath = path.join(__dirname, "../templates/supplier.ejs");

        const html = await ejs.renderFile(templatePath, {
            supplier,
            reports
        });

        const pdfDir = path.join(__dirname, `../uploads/supplier/${supplier._id}/pdfs/`);
        if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

        const pdfPath = path.join(pdfDir, `supplier_${supplier._id}.pdf`);

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
