const Supplier = require("../models/Supplier");

exports.createSupplier = async (req, res) => {
    try {
        const { title, contactMail, phone } = req.body;

        const supplier = await Supplier.create({
            title,
            contactMail,
            phone,
        });
        return res.json(supplier);
    } catch (err) {
        console.error(`Could not create a supplier ${err.message}`);
        return res.status(500).json({ error: `Could not create a supplier ${err.message}` });
    }
};
