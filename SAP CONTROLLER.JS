sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/core/Item",
    "sap/m/UploadCollection",
    "sap/m/UploadCollectionItem"
], function (Controller, JSONModel, MessageBox, MessageToast, Filter, FilterOperator, Sorter, Item, UploadCollection, UploadCollectionItem) {
    "use strict";

    return Controller.extend("com.tableentry.tablestructure.controller.Table_Entry", {
        onInit: function () {
            // Initial data for the table
            var oData = {
                items: [
                    { supplierRequestId: "R35", supplierName: "ABC Pvt Ltd", type: "Direct", requestCreationDate: "12-01-2024", requestAging: "10 Days", lastActionDate: "11-10-2024", lastActionAging: "15 Days", stage: "SUPPLIER", status: "PENDING" },
                    { supplierRequestId: "R18", supplierName: "XYZ Pvt Ltd", type: "Indirect", requestCreationDate: "12-02-2024", requestAging: "20 Days", lastActionDate: "12-10-2024", lastActionAging: "20 Days", stage: "SUPPLIER", status: "PENDING" },
                    { supplierRequestId: "R17", supplierName: "ABC Pvt Ltd", type: "Direct", requestCreationDate: "12-03-2024", requestAging: "30 Days", lastActionDate: "13-10-2024", lastActionAging: "30 Days", stage: "BUYER", status: "DRAFT" },
                    { supplierRequestId: "R16", supplierName: "XYZ Pvt Ltd", type: "Indirect", requestCreationDate: "12-04-2024", requestAging: "40 Days", lastActionDate: "14-10-2024", lastActionAging: "40 Days", stage: "BUYER", status: "CANCELLED" },
                    { supplierRequestId: "R15", supplierName: "ABC Pvt Ltd", type: "Direct", requestCreationDate: "12-05-2024", requestAging: "50 Days", lastActionDate: "15-10-2024", lastActionAging: "50 Days", stage: "ON BOARDING", status: "VENDOR CREATED" },
                    { supplierRequestId: "R14", supplierName: "ABC Pvt Ltd", type: "Direct", requestCreationDate: "12-06-2024", requestAging: "60 Days", lastActionDate: "16-10-2024", lastActionAging: "25 Days", stage: "ON BOARDING", status: "CMDM UPDATE PENDING" },
                    { supplierRequestId: "R13", supplierName: "ABC Pvt Ltd", type: "Indirect", requestCreationDate: "12-07-2024", requestAging: "70 Days", lastActionDate: "17-10-2024", lastActionAging: "35 Days", stage: "ON BOARDING", status: "FINANCE UPDATE PENDING" },
                    { supplierRequestId: "R12", supplierName: "XYZ Pvt Ltd", type: "Indirect", requestCreationDate: "12-08-2024", requestAging: "80 Days", lastActionDate: "18-10-2024", lastActionAging: "55 Days", stage: "ON BOARDING", status: "PURCHASE APPROVAL PENDING" },
                    { supplierRequestId: "R11", supplierName: "XYZ Pvt Ltd", type: "Indirect", requestCreationDate: "12-09-2024", requestAging: "90 Days", lastActionDate: "19-10-2024", lastActionAging: "45 Days", stage: "BUYER", status: "DRAFT" },
                    { supplierRequestId: "R10", supplierName: "XYZ Pvt Ltd", type: "Direct", requestCreationDate: "12-10-2024", requestAging: "100 Days", lastActionDate: "20-10-2024", lastActionAging: "75 Days", stage: "BUYER", status: "APPROVED" },
                    { supplierRequestId: "R9", supplierName: "XYZ Pvt Ltd", type: "Direct", requestCreationDate: "12-11-2024", requestAging: "110 Days", lastActionDate: "21-10-2024", lastActionAging: "65 Days", stage: "BUYER", status: "DRAFT" }
                ],
                draftCount: 0,
                myPendingCount: 0,
                pendingWithSupplierCount: 0,
                onBoardingCount: 0,
                allCount: 0
            };

            // Initialize sort states
            this._sortStates = {
                supplierRequestId: false,
                supplierName: false,
                type: false,
                requestCreationDate: false,
                requestAging: false,
                lastActionDate: false,
                lastActionAging: false,
                stage: false,
                status: false
            };

            // Store original items for reset
            this._originalItems = JSON.parse(JSON.stringify(oData.items));
            this._updateTileCounts(oData);

            // Set main model
            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "products");

            // Initialize new supplier model with enhanced data
            var oNewSupplierData = {
                spendType: "",
                supplierType: "LOCAL GST",
                gstin: "",
                pan: "",
                supplierFullLegalName: "",
                supplierTradeName: "",
                supplierAddress: "",
                supplierAddressCST: "",
                primaryContactFirstName: "",
                primaryContactLastName: "",
                primaryContactEmail: "",
                primaryContactMobile: "",
                isGroupSupplier: false,
                isGroupNotAvailable: false,
                parentSupplier: "",
                isParentNotAvailable: false,
                newParentSupplier: "",
                accountGroup: "",
                supplierAssessment: false,
                supplierDueDiligence: false,
                isDifferentAddress: false,
                differentAddress: "",
                purchasingOrg: "",
                paymentTerms: "",
                vendorCodeCreationType: "",
                buyerRequesting: "",
                isRelatedParty: false,
                businessJustification: "",
                additionalComments: "",
                attachments: [],
                incotermsCode: "",
                incotermsLocation: "",
                purchasingBlock: false,
                schemaGroup: ""
            };
            var oNewSupplierModel = new JSONModel(oNewSupplierData);
            this.getView().setModel(oNewSupplierModel, "newSupplier");

            // Initialize verification model
            var oVerificationData = {
                gstin: "",
                pan: "",
                isVerified: false,
                duplicateVendor: {
                    V0001: false,
                    V0002: false,
                    V0003: false
                },
                duplicateReason: "",
                differentAddress: ""
            };
            var oVerificationModel = new JSONModel(oVerificationData);
            this.getView().setModel(oVerificationModel, "verification");

            this._addCustomCSS();
        },

        _addCustomCSS: function () {
            var sStyle = `
                /* Combined and optimized CSS */
                .form-container { padding: 20px; max-width: 800px; margin: 20px auto; border: 1px solid #d9d9d9; border-radius: 8px; background-color: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .header { background-color: #ff0000; color: #fff; padding: 10px; text-align: center; border-radius: 8px 8px 0 0; font-size: 18px; font-weight: bold; }
                .panel { border: 1px solid #d9d9d9; border-radius: 4px; padding: 15px; margin-top: 10px; background-color: #f9f9f9; }
                .step-indicator { display: flex; align-items: center; margin-bottom: 20px; justify-content: center; }
                .step-number { width: 20px; height: 20px; border-radius: 50%; text-align: center; line-height: 20px; font-size: 12px; margin-right: 5px; }
                .step-text { font-size: 12px; line-height: 20px; margin-right: 10px; }
                .step-gap { width: 20px; height: 2px; background-color: #d3d3d3; margin: 0 5px; }
                .inactive-step { background-color: #d3d3d3; color: #666; }
                .active-step { background-color: #ff0000; color: #fff; }
                .active-step.step-text { background-color: transparent; color: #000; font-weight: bold; }
                .form-field { margin-bottom: 15px; }
                .form-field label { display: block; font-weight: bold; margin-bottom: 5px; }
                .form-field input, .form-field textarea, .form-field select { width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px; box-sizing: border-box; }
                .input-with-button { display: flex; align-items: center; gap: 10px; }
                .form-field button { padding: 8px 16px; background-color: #0070f0; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
                .form-field button:disabled { background-color: #d3d3d3; cursor: not-allowed; }
                .verified { background-color: #28a745; }
                .buttons { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
                .buttons button { padding: 8px 16px; border-radius: 4px; cursor: pointer; }
                .proceed { background-color: #0070f0; color: #fff; border: none; }
                .cancel { background-color: #fff; color: #ff0000; border: 1px solid #ff0000; }
                .previous { background-color: #fff; color: #000; border: 1px solid #d9d9d9; }
                .error { border-color: #ff0000 !important; }
                .error-message { color: #ff0000; font-size: 12px; margin-top: 5px; }
                .duplicate-warning { color: #ff0000; margin-bottom: 15px; display: flex; align-items: center; }
                .duplicate-warning::before { content: "⚠️"; margin-right: 5px; }
                .duplicate-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                .duplicate-table th, .duplicate-table td { border: 1px solid #d9d9d9; padding: 8px; text-align: left; }
                .duplicate-table th { background-color: #f7f7f7; }
                .duplicate-table input[type="radio"] { margin-right: 5px; }
                .reason-field { margin-top: 10px; }
                .field-container { display: flex; align-items: center; margin-bottom: 10px; }
                .radio-group { display: inline-flex; align-items: center; gap: 10px; }
                .radio-group input[type="radio"] { margin: 0 5px 0 0; }
                .radio-group label { font-weight: normal; margin: 0; }
                
                /* Table styling */
                .sapMListTbl .sapMListTblHeaderCell { text-align: center !important; vertical-align: middle !important; }
                .sort-button-container { display: flex; justify-content: center; align-items: center; width: 100%; }
                .sort-button { margin: 0 4px; padding: 4px 8px; min-width: 32px; }
                
                /* ObjectPage styling */
                .objectPageHeader { text-align: center !important; }
                .objectPageHeader .sapUxAPObjectPageHeaderTitle { text-align: center !important; justify-content: center !important; }
                
                /* Networked sections styling */
                .networked-section { background-color: #f5f5f5; border: 1px solid #d9d9d9; border-radius: 4px; margin-bottom: 16px; padding: 12px; }
                .networked-section-header { font-weight: bold; font-size: 14px; color: #333; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
                .networked-item { display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee; }
                .networked-item:last-child { border-bottom: none; }
                .networked-label { font-weight: bold; min-width: 200px; }
                .networked-value { flex-grow: 1; }
                
                /* Form styling */
                .form-section { margin-bottom: 24px; border: 1px solid #d9d9d9; border-radius: 4px; padding: 16px; background-color: #f9f9f9; }
                .form-section-title { font-weight: bold; font-size: 16px; color: #ff0000; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #d9d9d9; }
                .form-field-row { display: flex; margin-bottom: 12px; }
                .form-field { flex: 1; margin-right: 16px; }
                .form-field:last-child { margin-right: 0; }
                .form-field label { display: block; font-weight: bold; margin-bottom: 4px; color: #666; }
                .required-field label::after { content: " *"; color: #f00; }
                
                /* Purchasing Data section styling */
                .purchasing-data-section { display: flex; flex-wrap: wrap; gap: 16px; }
                .purchasing-data-field { flex: 1; min-width: 200px; }
                
                /* Additional Information section styling */
                .additional-info-section { display: flex; flex-direction: column; gap: 16px; }
                
                /* Footer buttons styling */
                .objectPageFooter { display: flex; justify-content: flex-end; padding: 16px; background-color: #f9f9f9; border-top: 1px solid #d9d9d9; position: sticky; bottom: 0; }
                .footer-button { margin-left: 8px; }
                
                /* Upload collection styling */
                .attachment-count { font-weight: bold; color: #0070f0; }
            `;
            var oStyle = document.createElement("style");
            oStyle.type = "text/css";
            oStyle.innerHTML = sStyle;
            document.getElementsByTagName("head")[0].appendChild(oStyle);
        },

        onVerifyGSTINAndPAN: function () {
            var oVerificationModel = this.getView().getModel("verification");
            var oGstinInput = this.byId("gstinInput");
            var oPanInput = this.byId("panInput");
            var oVerifyButton = this.byId("verifyButton");

            var sGstin = oGstinInput.getValue().trim();
            var sPan = oPanInput.getValue().trim();

            // GSTIN validation
            const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!sGstin) {
                oGstinInput.setValueState("Error").setValueStateText("GSTIN No. is required.");
                return;
            } else if (!gstinRegex.test(sGstin)) {
                oGstinInput.setValueState("Error").setValueStateText("Invalid GSTIN format (e.g., 27AABCU9603R1ZM).");
                return;
            } else {
                oGstinInput.setValueState("None");
            }

            // PAN validation
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (!sPan) {
                oPanInput.setValueState("Error").setValueStateText("PAN Card No. is required.");
                return;
            } else if (!panRegex.test(sPan)) {
                oPanInput.setValueState("Error").setValueStateText("Invalid PAN format (e.g., AABCU9603R).");
                return;
            } else {
                oPanInput.setValueState("None");
            }

            // Check against valid credentials
            const validCredentials = [
                { gstin: "27AABCU9603R1ZM", pan: "AABCU9603R" },
                { gstin: "29AAGCM1234P1ZT", pan: "AAGCM1234P" },
                { gstin: "33AAHCP7890N1ZF", pan: "AAHCP7890N" }
            ];

            const isValid = validCredentials.some(cred => cred.gstin === sGstin && cred.pan === sPan);

            if (isValid) {
                oVerifyButton.setText("Verified").addStyleClass("verified").setEnabled(false);
                oVerificationModel.setData({ isVerified: true, gstin: sGstin, pan: sPan });
                MessageToast.show("GSTIN and PAN verified successfully!");
                this.openDetailedSupplierForm({ gstin: sGstin, pan: sPan });
            } else {
                oVerifyButton.setText("Verify").removeStyleClass("verified").setEnabled(true);
                oVerificationModel.setProperty("/isVerified", false);
                MessageToast.show("Verification failed. Please check the GSTIN and PAN.");
            }
        },

        openDetailedSupplierForm: function (formData) {
            var oNewSupplierModel = this.getView().getModel("newSupplier");
            var oFormData = oNewSupplierModel.getData();
            Object.assign(oFormData, {
                gstin: formData.gstin || "",
                pan: formData.pan || "",
                supplierFullLegalName: formData.supplierFullLegalName || "",
                supplierTradeName: formData.supplierTradeName || "",
                supplierAddress: formData.supplierAddress || "",
                supplierAddressCST: formData.supplierAddressCST || "",
                primaryContactFirstName: formData.primaryContactFirstName || "",
                primaryContactLastName: formData.primaryContactLastName || "",
                primaryContactEmail: formData.primaryContactEmail || "",
                primaryContactMobile: formData.primaryContactMobile || ""
            });
            oNewSupplierModel.setData(oFormData);

            var sHtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Supplier Request Form</title>
    <link rel="stylesheet" href="https://sapui5.hana.ondemand.com/resources/sap/ui/core/themes/sap_fiori_3/library.css">
    <link rel="stylesheet" href="https://sapui5.hana.ondemand.com/resources/sap/m/themes/sap_fiori_3/library.css">
    <link rel="stylesheet" href="https://sapui5.hana.ondemand.com/resources/sap/uxap/themes/sap_fiori_3/library.css">
    <script src="https://sapui5.hana.ondemand.com/resources/sap-ui-core.js"
        id="sap-ui-bootstrap"
        data-sap-ui-libs="sap.m, sap.uxap, sap.ui.layout"
        data-sap-ui-theme="sap_fiori_3"
        data-sap-ui-compatVersion="edge"
        data-sap-ui-async="true">
    </script>
    <style>
        .objectPageHeader { text-align: center !important; }
        .objectPageHeader .sapUxAPObjectPageHeaderTitle { text-align: center !important; justify-content: center !important; }
        .form-section { margin-bottom: 16px; padding: 16px; background-color: #f9f9f9; border: 1px solid #d9d9d9; border-radius: 4px; }
        .form-section-title { font-weight: bold; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #d9d9d9; color: #ff0000; }
        .form-field-row { display: flex; margin-bottom: 12px; }
        .form-field { flex: 1; margin-right: 16px; }
        .form-field:last-child { margin-right: 0; }
        .attachment-count { font-weight: bold; color: #0070f0; }
    </style>
</head>
<body>
    <div id="content"></div>
    <script>
        sap.ui.getCore().attachInit(function () {
            var oUploadCollection = new sap.m.UploadCollection({
                multiple: true,
                uploadEnabled: true,
                fileDeleted: function(oEvent) { updateAttachmentCount(); },
                uploadComplete: function(oEvent) { updateAttachmentCount(); },
                items: {
                    path: "/attachments",
                    template: new sap.m.UploadCollectionItem({ fileName: "{fileName}" })
                }
            });
            
            function updateAttachmentCount() {
                var iCount = oUploadCollection.getItems().length;
                var oAttachmentCount = sap.ui.getCore().byId("attachmentCount");
                if (oAttachmentCount) oAttachmentCount.setText("(" + iCount + ")");
            }
            
            var oModel = new sap.ui.model.json.JSONModel({
                formData: ${JSON.stringify(oFormData)},
                attachments: ${JSON.stringify(oFormData.attachments)}
            });
            sap.ui.getCore().setModel(oModel);

            new sap.m.App({
                pages: [
                    new sap.uxap.ObjectPageLayout({
                        headerTitle: new sap.uxap.ObjectPageHeader({
                            objectTitle: "NEW SUPPLIER REQUEST FORM",
                            objectSubtitle: "",
                            headerDesign: "Dark",
                            isObjectIconAlwaysVisible: false
                        }).addStyleClass("objectPageHeader"),
                        sections: [
                            new sap.uxap.ObjectPageSection({
                                title: "Supplier Identification",
                                titleUppercase: false,
                                subSections: [
                                    new sap.uxap.ObjectPageSubSection({
                                        blocks: [
                                            new sap.ui.layout.form.SimpleForm({
                                                editable: true,
                                                layout: "ResponsiveGridLayout",
                                                labelSpanL: 4,
                                                labelSpanM: 4,
                                                labelSpanS: 12,
                                                content: [
                                                    new sap.m.Label({ text: "Supplier Spend Type:", design: "Bold", required: true }),
                                                    new sap.m.Select({
                                                        width: "100%",
                                                        items: [
                                                            new sap.ui.core.Item({ key: "", text: "Select" }),
                                                            new sap.ui.core.Item({ key: "Direct", text: "Direct" }),
                                                            new sap.ui.core.Item({ key: "Indirect", text: "Indirect" }),
                                                            new sap.ui.core.Item({ key: "Capital", text: "Capital" })
                                                        ],
                                                        selectedKey: "{/formData/spendType}"
                                                    }),
                                                    new sap.m.Label({ text: "Supplier Type:", design: "Bold", required: true }),
                                                    new sap.m.Select({
                                                        width: "100%",
                                                        items: [
                                                            new sap.ui.core.Item({ key: "", text: "Select" }),
                                                            new sap.ui.core.Item({ key: "LOCAL GST", text: "LOCAL GST" }),
                                                            new sap.ui.core.Item({ key: "LOCAL NON-GST", text: "LOCAL NON-GST" }),
                                                            new sap.ui.core.Item({ key: "IMPORT", text: "IMPORT" })
                                                        ],
                                                        selectedKey: "{/formData/supplierType}"
                                                    }),
                                                    new sap.m.Label({ text: "GSTIN No:", design: "Bold", required: true }),
                                                    new sap.m.Input({ value: "{/formData/gstin}", editable: false }),
                                                    new sap.m.Label({ text: "PAN Card No:", design: "Bold", required: true }),
                                                    new sap.m.Input({ value: "{/formData/pan}", editable: false })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }),
                            new sap.uxap.ObjectPageSection({
                                title: "General Supplier Information",
                                titleUppercase: false,
                                subSections: [
                                    new sap.uxap.ObjectPageSubSection({
                                        blocks: [
                                            new sap.ui.layout.form.SimpleForm({
                                                editable: true,
                                                layout: "ResponsiveGridLayout",
                                                labelSpanL: 4,
                                                labelSpanM: 4,
                                                labelSpanS: 12,
                                                content: [
                                                    new sap.m.Label({ text: "Supplier Full Legal Name:", design: "Bold", required: true }),
                                                    new sap.m.Input({ value: "{/formData/supplierFullLegalName}" }),
                                                    new sap.m.Label({ text: "Supplier Trade Name (GST):", design: "Bold" }),
                                                    new sap.m.Input({ value: "{/formData/supplierTradeName}" }),
                                                    new sap.m.Label({ text: "Supplier Address:", design: "Bold", required: true }),
                                                    new sap.m.TextArea({ value: "{/formData/supplierAddress}", rows: 3 }),
                                                    new sap.m.Label({ text: "Supplier Address (GST):", design: "Bold" }),
                                                    new sap.m.TextArea({ value: "{/formData/supplierAddressCST}", rows: 3 }),
                                                    new sap.m.Label({ text: "Primary Contact First Name:", design: "Bold" }),
                                                    new sap.m.Input({ value: "{/formData/primaryContactFirstName}" }),
                                                    new sap.m.Label({ text: "Primary Contact Last Name:", design: "Bold" }),
                                                    new sap.m.Input({ value: "{/formData/primaryContactLastName}" }),
                                                    new sap.m.Label({ text: "Primary Contact Email:", design: "Bold" }),
                                                    new sap.m.Input({ value: "{/formData/primaryContactEmail}", type: "Email" }),
                                                    new sap.m.Label({ text: "Primary Contact Mobile Number:", design: "Bold" }),
                                                    new sap.m.Input({ value: "{/formData/primaryContactMobile}", type: "Tel" })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }),
                            new sap.uxap.ObjectPageSection({
                                title: "Purchasing Data",
                                titleUppercase: false,
                                subSections: [
                                    new sap.uxap.ObjectPageSubSection({
                                        blocks: [
                                            new sap.ui.layout.form.SimpleForm({
                                                editable: true,
                                                layout: "ResponsiveGridLayout",
                                                labelSpanL: 4,
                                                labelSpanM: 4,
                                                labelSpanS: 12,
                                                content: [
                                                    new sap.m.Label({ text: "Purchasing Org:", design: "Bold", required: true }),
                                                    new sap.m.Input({ value: "{/formData/purchasingOrg}" }),
                                                    new sap.m.Label({ text: "Payment Terms:", design: "Bold" }),
                                                    new sap.m.Input({ value: "{/formData/paymentTerms}" }),
                                                    new sap.m.Label({ text: "Is the vendor code registered with another address:", design: "Bold" }),
                                                    new sap.m.RadioButtonGroup({
                                                        buttons: [
                                                            new sap.m.RadioButton({ text: "Yes" }),
                                                            new sap.m.RadioButton({ text: "No", selected: true })
                                                        ],
                                                        select: function(oEvent) {
                                                            var bSelected = oEvent.getParameters().selectedIndex === 0;
                                                            oModel.setProperty("/formData/isDifferentAddress", bSelected);
                                                        }
                                                    }),
                                                    new sap.m.Label({ text: "Different Address:", design: "Bold" }),
                                                    new sap.m.TextArea({ value: "{/formData/differentAddress}", rows: 3, visible: "{/formData/isDifferentAddress}" })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }),
                            new sap.uxap.ObjectPageSection({
                                title: "Additional Information",
                                titleUppercase: false,
                                subSections: [
                                    new sap.uxap.ObjectPageSubSection({
                                        blocks: [
                                            new sap.ui.layout.form.SimpleForm({
                                                editable: true,
                                                layout: "ResponsiveGridLayout",
                                                labelSpanL: 4,
                                                labelSpanM: 4,
                                                labelSpanS: 12,
                                                content: [
                                                    new sap.m.Label({ text: "Business Justification for New Supplier:", design: "Bold" }),
                                                    new sap.m.TextArea({ value: "{/formData/businessJustification}", rows: 3 }),
                                                    new sap.m.Label({ text: "Additional Comments:", design: "Bold" }),
                                                    new sap.m.TextArea({ value: "{/formData/additionalComments}", rows: 3 }),
                                                    new sap.m.Label({ text: "Attachments <span id='attachmentCount' class='attachment-count'>(0)</span>:", design: "Bold" }),
                                                    oUploadCollection
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            })
                        ],
                        footer: new sap.m.Toolbar({
                            content: [
                                new sap.m.ToolbarSpacer(),
                                new sap.m.Button({
                                    text: "Save",
                                    type: "Accept",
                                    press: function () {
                                        var oModel = sap.ui.getCore().getModel();
                                        var oFormData = oModel.getProperty("/formData");
                                        if (!oFormData.spendType || !oFormData.supplierType || !oFormData.supplierFullLegalName || 
                                            !oFormData.supplierAddress || !oFormData.purchasingOrg) {
                                            sap.m.MessageToast.show("Please fill in all required fields");
                                            return;
                                        }
                                        var aAttachments = [];
                                        oUploadCollection.getItems().forEach(function(oItem) {
                                            aAttachments.push({ fileName: oItem.getFileName() });
                                        });
                                        oFormData.attachments = aAttachments;
                                        if (window.opener && !window.opener.closed) {
                                            window.opener.postMessage({ type: "SUPPLIER_FORM_SAVED", data: oFormData }, "*");
                                        }
                                        sap.m.MessageToast.show("Supplier Request Form saved successfully!");
                                    }
                                }).addStyleClass("footer-button"),
                                new sap.m.Button({
                                    text: "Cancel",
                                    type: "Reject",
                                    press: function () {
                                        if (confirm("Are you sure you want to cancel?")) window.close();
                                    }
                                }).addStyleClass("footer-button"),
                                new sap.m.Button({
                                    text: "Download",
                                    press: function () {
                                        var oFormData = sap.ui.getCore().getModel().getProperty("/formData");
                                        var sCSVContent = "Field,Value\n";
                                        for (var sKey in oFormData) {
                                            if (typeof oFormData[sKey] !== "object" || sKey === "attachments") {
                                                var sValue = Array.isArray(oFormData[sKey]) ? 
                                                    oFormData[sKey].map(o => o.fileName).join(", ") : oFormData[sKey];
                                            }
                                        }
                                        var oBlob = new Blob([sCSVContent], { type: "text/csv;charset=utf-8;" });
                                        var sURL = window.URL.createObjectURL(oBlob);
                                        var oLink = document.createElement("a");
                                        oLink.href = sURL;
                                        oLink.download = "Supplier_Form_Data.csv";
                                        document.body.appendChild(oLink);
                                        oLink.click();
                                        document.body.removeChild(oLink);
                                        sap.m.MessageToast.show("Form data downloaded as CSV.");
                                    }
                                }).addStyleClass("footer-button")
                            ]
                        }).addStyleClass("objectPageFooter")
                    })
                ]
            }).placeAt("content");
            updateAttachmentCount();
        });
    </script>
</body>
</html>
            `;

            var newWindow = window.open("", "_blank");
            if (newWindow) {
                newWindow.document.write(sHtmlContent);
                newWindow.document.close();
                window.addEventListener("message", (event) => {
                    if (event.data.type === "SUPPLIER_FORM_SAVED") this._handleSavedSupplierForm(event.data.data);
                });
            } else {
                MessageToast.show("Failed to open new tab. Please allow pop-ups for this site.");
            }
        },

        _handleSavedSupplierForm: function(oFormData) {
            var oModel = this.getView().getModel("products");
            var oData = oModel.getData();
            var aItems = oData.items;

            var iLastId = Math.max(...aItems.map(item => parseInt(item.supplierRequestId.replace("R", ""), 10)));
            var sNewId = "R" + (iLastId + 1).toString().padStart(2, "0");

            var oDate = new Date();
            var sCurrentDate = `${oDate.getDate().toString().padStart(2, "0")}-${(oDate.getMonth() + 1).toString().padStart(2, "0")}-${oDate.getFullYear()}`;

            var oNewSupplier = {
                supplierRequestId: sNewId,
                supplierName: oFormData.supplierFullLegalName,
                type: oFormData.spendType,
                requestCreationDate: sCurrentDate,
                requestAging: "0 Days",
                lastActionDate: sCurrentDate,
                lastActionAging: "0 Days",
                stage: "SUPPLIER",
                status: "PENDING",
                attachments: oFormData.attachments
            };

            aItems.unshift(oNewSupplier);
            this._updateTileCounts(oData);
            oModel.setData(oData);
            this._originalItems = JSON.parse(JSON.stringify(oData.items));
            this._refreshTable();
            MessageToast.show(`New Supplier Request created successfully! ID: ${sNewId}`);
        },

        onDifferentAddressSelect: function (sValue) {
            this.getView().getModel("verification").setProperty("/differentAddress", sValue);
        },

        _updateTileCounts: function (oData) {
            var aItems = oData.items;
            oData.draftCount = aItems.filter(item => item.status === "DRAFT").length;
            oData.myPendingCount = aItems.filter(item => item.stage === "BUYER").length;
            oData.pendingWithSupplierCount = aItems.filter(item => item.stage === "SUPPLIER").length;
            oData.onBoardingCount = aItems.filter(item => item.stage === "ON BOARDING").length;
            oData.allCount = aItems.length;
        },

        _applyFilters: function () {
            var oTable = this.byId("productsTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];

            var sSupplierId = this.byId("supplierIdInput").getValue();
            if (sSupplierId) aFilters.push(new Filter("supplierRequestId", FilterOperator.Contains, sSupplierId));

            var sSupplierType = this.byId("supplierTypeComboBox").getSelectedKey();
            if (sSupplierType && sSupplierType !== "All") aFilters.push(new Filter("type", FilterOperator.EQ, sSupplierType));

            var sStage = this.byId("stageComboBox").getSelectedKey();
            if (sStage && sStage !== "All") aFilters.push(new Filter("stage", FilterOperator.EQ, sStage));

            var sStatus = this.byId("statusComboBox").getSelectedKey();
            if (sStatus && sStatus !== "All") aFilters.push(new Filter("status", FilterOperator.EQ, sStatus));

            oBinding.filter(aFilters.length > 0 ? new Filter({ filters: aFilters, and: true }) : []);
        },

        onSupplierIdChange: function () { this._applyFilters(); },
        onSupplierTypeChange: function () { this._applyFilters(); },
        onStageChange: function () { this._applyFilters(); },
        onStatusChange: function () { this._applyFilters(); },

        _refreshTable: function () {
            var oTable = this.byId("productsTable");
            if (oTable && oTable.getBinding("items")) oTable.getBinding("items").refresh(true);
        },

        _centerTiles: function () {
            var oGrid = this.byId("tileGrid");
            if (oGrid) oGrid.addStyleClass("centeredGrid");
        },

        _parseDate: function (sDate) {
            if (!sDate) return new Date(0);
            var [day, month, year] = sDate.split("-").map(Number);
            return new Date(year, month - 1, day);
        },

        _updateSortIcon: function (sColumnKey, bDescending) {
            var oIcon = this.byId("sortIcon_" + sColumnKey);
            if (oIcon) oIcon.setSrc(bDescending ? "sap-icon://sort-descending" : "sap-icon://sort-ascending");
        },

        _sortColumn: function (sProperty, fnCompare) {
            var oModel = this.getView().getModel("products");
            var oData = oModel.getData();
            var aItems = oData.items;

            if (!aItems || !aItems.length) {
                MessageToast.show("No data to sort.");
                return;
            }

            this._sortStates[sProperty] = !this._sortStates[sProperty];
            var bDescending = this._sortStates[sProperty];

            try {
                aItems.sort((a, b) => bDescending ? fnCompare(b[sProperty], a[sProperty]) : fnCompare(a[sProperty], b[sProperty]));
                oModel.setProperty("/items", aItems);
                this._centerTiles();
                this._refreshTable();
                this._updateSortIcon(sProperty, bDescending);
                MessageToast.show(`Sorted ${sProperty} column ${bDescending ? "Descending" : "Ascending"}`);
            } catch (e) {
                MessageToast.show(`Error while sorting ${sProperty}: ${e.message}`);
            }
        },

        onSortSupplierRequestId: function () {
            this._sortColumn("supplierRequestId", (a, b) => {
                var aNum = parseInt(a.replace("R", ""), 10) || 0;
                var bNum = parseInt(b.replace("R", ""), 10) || 0;
                return aNum - bNum;
            });
        },

        onSortSupplierName: function () {
            this._sortColumn("supplierName", (a, b) => (a || "").localeCompare(b || ""));
        },

        onSortType: function () {
            this._sortColumn("type", (a, b) => (a || "").localeCompare(b || ""));
        },

        onSortRequestCreationDate: function () {
            this._sortColumn("requestCreationDate", (a, b) => this._parseDate(a) - this._parseDate(b));
        },

        onSortRequestAging: function () {
            this._sortColumn("requestAging", (a, b) => {
                var aDays = parseInt(a.split(" ")[0], 10) || 0;
                var bDays = parseInt(b.split(" ")[0], 10) || 0;
                return aDays - bDays;
            });
        },

        onSortLastActionDate: function () {
            this._sortColumn("lastActionDate", (a, b) => this._parseDate(a) - this._parseDate(b));
        },

        onSortLastActionAging: function () {
            this._sortColumn("lastActionAging", (a, b) => {
                var aDays = parseInt(a.split(" ")[0], 10) || 0;
                var bDays = parseInt(b.split(" ")[0], 10) || 0;
                return aDays - bDays;
            });
        },

        onSortStage: function () {
            this._sortColumn("stage", (a, b) => (a || "").localeCompare(b || ""));
        },

        onSortStatus: function () {
            this._sortColumn("status", (a, b) => (a || "").localeCompare(b || ""));
        },

        onTilePress: function (oEvent) {
            var sTileId = oEvent.getSource().getId();
            var oTable = this.byId("productsTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];

            if (sTileId.includes("draftTile")) aFilters.push(new Filter("status", FilterOperator.EQ, "DRAFT"));
            else if (sTileId.includes("myPendingTile")) aFilters.push(new Filter("stage", FilterOperator.EQ, "BUYER"));
            else if (sTileId.includes("pendingWithSupplierTile")) aFilters.push(new Filter("stage", FilterOperator.EQ, "SUPPLIER"));
            else if (sTileId.includes("onBoardingTile")) aFilters.push(new Filter("stage", FilterOperator.EQ, "ON BOARDING"));
            else if (sTileId.includes("allTile")) {
                oBinding.filter([]);
                this.byId("supplierIdInput").setValue("");
                this.byId("supplierTypeComboBox").setSelectedKey("All");
                this.byId("stageComboBox").setSelectedKey("All");
                this.byId("statusComboBox").setSelectedKey("All");
                return;
            }

            oBinding.filter(aFilters);
            this.byId("supplierIdInput").setValue("");
            this.byId("supplierTypeComboBox").setSelectedKey("All");
            this.byId("stageComboBox").setSelectedKey("All");
            this.byId("statusComboBox").setSelectedKey("All");
        },

        onOrderPress: function () {
            var oNewSupplierModel = this.getView().getModel("newSupplier");
            oNewSupplierModel.setData({
                spendType: "",
                supplierType: "LOCAL GST",
                gstin: "",
                pan: "",
                supplierFullLegalName: "",
                supplierTradeName: "",
                supplierAddress: "",
                supplierAddressCST: "",
                primaryContactFirstName: "",
                primaryContactLastName: "",
                primaryContactEmail: "",
                primaryContactMobile: "",
                isGroupSupplier: false,
                isGroupNotAvailable: false,
                parentSupplier: "",
                isParentNotAvailable: false,
                newParentSupplier: "",
                accountGroup: "",
                supplierAssessment: false,
                supplierDueDiligence: false,
                isDifferentAddress: false,
                differentAddress: "",
                purchasingOrg: "",
                paymentTerms: "",
                vendorCodeCreationType: "",
                buyerRequesting: "",
                isRelatedParty: false,
                businessJustification: "",
                additionalComments: "",
                attachments: [],
                incotermsCode: "",
                incotermsLocation: "",
                purchasingBlock: false,
                schemaGroup: ""
            });

            var sHtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Supplier Request Form</title>
    <style>
        .form-container { padding: 20px; max-width: 800px; margin: 20px auto; border: 1px solid #d9d9d9; border-radius: 8px; background-color: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background-color: #ff0000; color: #fff; padding: 10px; text-align: center; border-radius: 8px 8px 0 0; font-size: 18px; font-weight: bold; }
        .panel { border: 1px solid #d9d9d9; border-radius: 4px; padding: 15px; margin-top: 10px; background-color: #f9f9f9; }
        .step-indicator { display: flex; align-items: center; margin-bottom: 20px; justify-content: center; }
        .step-number { width: 20px; height: 20px; border-radius: 50%; text-align: center; line-height: 20px; font-size: 12px; margin-right: 5px; }
        .step-text { font-size: 12px; line-height: 20px; margin-right: 10px; }
        .step-gap { width: 20px; height: 2px; background-color: #d3d3d3; margin: 0 5px; }
        .inactive-step { background-color: #d3d3d3; color: #666; }
        .active-step { background-color: #ff0000; color: #fff; }
        .active-step.step-text { background-color: transparent; color: #000; font-weight: bold; }
        .form-field { margin-bottom: 15px; }
        .form-field label { display: block; font-weight: bold; margin-bottom: 5px; }
        .form-field input, .form-field textarea, .form-field select { width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px; box-sizing: border-box; }
        .input-with-button { display: flex; align-items: center; gap: 10px; }
        .form-field button { padding: 8px 16px; background-color: #0070f0; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
        .form-field button:disabled { background-color: #d3d3d3; cursor: not-allowed; }
        .verified { background-color: #28a745; }
        .buttons { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
        .buttons button { padding: 8px 16px; border-radius: 4px; cursor: pointer; }
        .proceed { background-color: #0070f0; color: #fff; border: none; }
        .cancel { background-color: #fff; color: #ff0000; border: 1px solid #ff0000; }
        .previous { background-color: #fff; color: #000; border: 1px solid #d9d9d9; }
        .error { border-color: #ff0000 !important; }
        .error-message { color: #ff0000; font-size: 12px; margin-top: 5px; }
        .duplicate-warning { color: #ff0000; margin-bottom: 15px; display: flex; align-items: center; }
        .duplicate-warning::before { content: "⚠️"; margin-right: 5px; }
        .duplicate-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .duplicate-table th, .duplicate-table td { border: 1px solid #d9d9d9; padding: 8px; text-align: left; }
        .duplicate-table th { background-color: #f7f7f7; }
        .duplicate-table input[type="radio"] { margin-right: 5px; }
        .reason-field { margin-top: 10px; }
        .field-container { display: flex; align-items: center; margin-bottom: 10px; }
        .radio-group { display: inline-flex; align-items: center; gap: 10px; }
        .radio-group input[type="radio"] { margin: 0 5px 0 0; }
        .radio-group label { font-weight: normal; margin: 0; }
    </style>
</head>
<body>
    <div class="form-container">
        <div class="header">NEW SUPPLIER REQUEST FORM</div>
        <div class="panel">
            <div id="stepIndicator" class="step-indicator">
                <div id="step1Number" class="step-number active-step">1</div>
                <div id="step1Text" class="step-text active-step">SUPPLIER SPEND TYPE</div>
                <div class="step-gap"></div>
                <div id="step2Number" class="step-number inactive-step">2</div>
                <div id="step2Text" class="step-text inactive-step">SUPPLIER TYPE</div>
                <div class="step-gap"></div>
                <div id="step3Number" class="step-number inactive-step">3</div>
                <div id="step3Text" class="step-text inactive-step">GST & PAN VERIFICATION</div>
            </div>
            <div id="formContent">
                <div id="step1" class="step-content">
                    <div class="form-field">
                        <label for="spendType">SUPPLIER SPEND TYPE: <span style="color: #ff0000;">*</span></label>
                        <select id="spendType">
                            <option value="">Select Spend Type</option>
                            <option value="Direct">Direct</option>
                            <option value="Indirect">Indirect</option>
                            <option value="Capital">Capital</option>
                            <option value="Value Fit">Value Fit</option>
                            <option value="Proto">Proto</option>
                            <option value="Accessories">Accessories</option>
                        </select>
                        <div id="spendTypeError" class="error-message" style="display: none;">Please select a spend type.</div>
                    </div>
                </div>
                <div id="step2" class="step-content" style="display: none;">
                    <div class="form-field">
                        <label for="supplierType">SUPPLIER TYPE: <span style="color: #ff0000;">*</span></label>
                        <select id="supplierType">
                            <option value="">Select Supplier Type</option>
                            <option value="LOCAL GST">LOCAL GST</option>
                            <option value="LOCAL NON-GST">LOCAL NON-GST</option>
                            <option value="IMPORT">IMPORT</option>
                        </select>
                        <div id="supplierTypeError" class="error-message" style="display: none;">Please select a supplier type.</div>
                    </div>
                </div>
                <div id="step3" class="step-content" style="display: none;">
                    <div id="duplicateWarning" class="duplicate-warning" style="display: none;">Duplicate Found: Vendor already exists with same GSTIN/PAN</div>
                    <table id="duplicateTable" class="duplicate-table" style="display: none;">
                        <thead><tr><th></th><th>Vendor Code</th><th>Spend Type</th><th>Postal Code</th></tr></thead>
                        <tbody>
                            <tr><td><input type="radio" name="duplicateVendor" value="V0001" onclick="updateProceedButton()"></td><td>V0001</td><td>Direct</td><td>122001</td></tr>
                            <tr><td><input type="radio" name="duplicateVendor" value="V0002" onclick="updateProceedButton()"></td><td>V0002</td><td>Direct</td><td>122001</td></tr>
                            <tr><td><input type="radio" name="duplicateVendor" value="V0003" onclick="updateProceedButton()"></td><td>V0003</td><td>Direct</td><td>122001</td></tr>
                        </tbody>
                    </table>
                    <div id="reasonField" class="reason-field" style="display: none;">
                        <div class="form-field">
                            <label for="duplicateReason">PROVIDE REASON for creating Duplicate Vendor Code:</label>
                            <input type="text" id="duplicateReason" placeholder="Enter reason" oninput="updateProceedButton()">
                            <div id="duplicateReasonError" class="error-message" style="display: none;">Please provide a reason.</div>
                        </div>
                        <div class="form-field">
                            <div class="field-container">
                                <label>DIFFERENT ADDRESS</label>
                                <div class="radio-group">
                                    <input type="radio" name="differentAddress" value="Yes" id="differentAddressYes" onclick="updateProceedButton()">
                                    <label for="differentAddressYes">Yes</label>
                                    <input type="radio" name="differentAddress" value="No" id="differentAddressNo" onclick="updateProceedButton()">
                                    <label for="differentAddressNo">No</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-field">
                        <label for="gstin">GSTIN No.: <span style="color: #ff0000;">*</span></label>
                        <div class="input-with-button">
                            <input type="text" id="gstin" placeholder="Enter GSTIN No.">
                            <button id="gstinVerifyButton" onclick="verifyGSTIN()">Verify</button>
                        </div>
                        <div id="gstinError" class="error-message" style="display: none;"></div>
                    </div>
                    <div class="form-field">
                        <label for="pan">PAN Card No.: <span style="color: #ff0000;">*</span></label>
                        <div class="input-with-button">
                            <input type="text" id="pan" placeholder="Enter PAN Card No.">
                            <button id="panVerifyButton" onclick="verifyPAN()">Verify</button>
                        </div>
                        <div id="panError" class="error-message" style="display: none;"></div>
                    </div>
                    <div class="form-field">
                        <label for="address">Address</label>
                        <textarea id="address" placeholder="Enter Address" rows="3"></textarea>
                    </div>
                </div>
            </div>
            <div class="buttons">
                <button id="previousButton" class="previous" onclick="previousStep()" style="display: none;">Previous Step</button>
                <button id="nextButton" class="proceed" onclick="nextStep()">Next Step</button>
                <button id="proceedButton" class="proceed" onclick="proceed()" style="display: none;" disabled>Proceed</button>
                <button class="cancel" onclick="cancel()">Cancel</button>
            </div>
        </div>
    </div>
    <script>
        let currentStep = 1;
        let isGstinVerified = false;
        let isPanVerified = false;
        let formData = {
            spendType: "",
            supplierType: "",
            gstin: "",
            pan: "",
            address: "",
            isVerified: false,
            duplicateVendor: "",
            duplicateReason: "",
            differentAddress: "",
            supplierFullLegalName: "",
            supplierTradeName: "",
            supplierAddress: "",
            supplierAddressCST: "",
            primaryContactFirstName: "",
            primaryContactLastName: "",
            primaryContactEmail: "",
            primaryContactMobile: "",
            isGroupSupplier: false,
            isGroupNotAvailable: false,
            parentSupplier: "",
            isParentNotAvailable: false,
            newParentSupplier: "",
            accountGroup: "",
            supplierAssessment: false,
            supplierDueDiligence: false,
            isDifferentAddress: false,
            purchasingOrg: "",
            paymentTerms: "",
            vendorCodeCreationType: "",
            buyerRequesting: "",
            isRelatedParty: false,
            businessJustification: "",
            additionalComments: "",
            attachments: [],
            incotermsCode: "",
            incotermsLocation: "",
            purchasingBlock: false,
            schemaGroup: ""
        };

        function updateStepIndicator() {
            document.getElementById("step1Number").className = "step-number " + (currentStep === 1 ? "active-step" : "inactive-step");
            document.getElementById("step1Text").className = "step-text " + (currentStep === 1 ? "active-step" : "inactive-step");
            document.getElementById("step2Number").className = "step-number " + (currentStep === 2 ? "active-step" : "inactive-step");
            document.getElementById("step2Text").className = "step-text " + (currentStep === 2 ? "active-step" : "inactive-step");
            document.getElementById("step3Number").className = "step-number " + (currentStep === 3 ? "active-step" : "inactive-step");
            document.getElementById("step3Text").className = "step-text " + (currentStep === 3 ? "active-step" : "inactive-step");

            document.getElementById("step1").style.display = currentStep === 1 ? "block" : "none";
            document.getElementById("step2").style.display = currentStep === 2 ? "block" : "none";
            document.getElementById("step3").style.display = currentStep === 3 ? "block" : "none";

            document.getElementById("previousButton").style.display = currentStep === 1 ? "none" : "inline-block";
            document.getElementById("nextButton").style.display = currentStep < 3 ? "inline-block" : "none";
            document.getElementById("proceedButton").style.display = currentStep === 3 ? "inline-block" : "none";
        }

        function nextStep() {
            if (currentStep === 1) {
                formData.spendType = document.getElementById("spendType").value;
                if (!formData.spendType) {
                    document.getElementById("spendType").classList.add("error");
                    document.getElementById("spendTypeError").style.display = "block";
                    return;
                }
                document.getElementById("spendType").classList.remove("error");
                document.getElementById("spendTypeError").style.display = "none";
                currentStep++;
            } else if (currentStep === 2) {
                formData.supplierType = document.getElementById("supplierType").value;
                if (!formData.supplierType) {
                    document.getElementById("supplierType").classList.add("error");
                    document.getElementById("supplierTypeError").style.display = "block";
                    return;
                }
                document.getElementById("supplierType").classList.remove("error");
                document.getElementById("supplierTypeError").style.display = "none";
                currentStep++;
                checkForDuplicates();
            }
            updateStepIndicator();
        }

        function previousStep() {
            if (currentStep > 1) {
                currentStep--;
                document.getElementById("duplicateWarning").style.display = "none";
                document.getElementById("duplicateTable").style.display = "none";
                document.getElementById("reasonField").style.display = "none";
                updateStepIndicator();
            }
        }

        function verifyGSTIN() {
            formData.gstin = document.getElementById("gstin").value.trim();
            const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!formData.gstin) {
                document.getElementById("gstin").classList.add("error");
                document.getElementById("gstinError").textContent = "GSTIN No. is required.";
                document.getElementById("gstinError").style.display = "block";
                return;
            } else if (!gstinRegex.test(formData.gstin)) {
                document.getElementById("gstin").classList.add("error");
                document.getElementById("gstinError").textContent = "Invalid GSTIN format (e.g., 27AABCU9603R1ZM).";
                document.getElementById("gstinError").style.display = "block";
                return;
            } else {
                document.getElementById("gstin").classList.remove("error");
                document.getElementById("gstinError").style.display = "none";
            }
            const validGSTINs = ["27AABCU9603R1ZM", "29AAGCM1234P1ZT", "33AAHCP7890N1ZF"];
            if (validGSTINs.includes(formData.gstin)) {
                document.getElementById("gstinVerifyButton").textContent = "Verified";
                document.getElementById("gstinVerifyButton").classList.add("verified");
                document.getElementById("gstinVerifyButton").disabled = true;
                isGstinVerified = true;
                checkForDuplicates();
                alert("GSTIN verified successfully!");
            } else {
                document.getElementById("gstinVerifyButton").textContent = "Verify";
                document.getElementById("gstinVerifyButton").classList.remove("verified");
                document.getElementById("gstinVerifyButton").disabled = false;
                isGstinVerified = false;
                alert("GSTIN verification failed. Please check the GSTIN.");
            }
        }

        function verifyPAN() {
            formData.pan = document.getElementById("pan").value.trim();
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (!formData.pan) {
                document.getElementById("pan").classList.add("error");
                document.getElementById("panError").textContent = "PAN Card No. is required.";
                document.getElementById("panError").style.display = "block";
                return;
            } else if (!panRegex.test(formData.pan)) {
                document.getElementById("pan").classList.add("error");
                document.getElementById("panError").textContent = "Invalid PAN format (e.g., AABCU9603R).";
                document.getElementById("panError").style.display = "block";
                return;
            } else {
                document.getElementById("pan").classList.remove("error");
                document.getElementById("panError").style.display = "none";
            }
            const validPANs = ["AABCU9603R", "AAGCM1234P", "AAHCP7890N"];
            if (validPANs.includes(formData.pan)) {
                document.getElementById("panVerifyButton").textContent = "Verified";
                document.getElementById("panVerifyButton").classList.add("verified");
                document.getElementById("panVerifyButton").disabled = true;
                isPanVerified = true;
                checkForDuplicates();
                alert("PAN verified successfully!");
            } else {
                document.getElementById("panVerifyButton").textContent = "Verify";
                document.getElementById("panVerifyButton").classList.remove("verified");
                document.getElementById("panVerifyButton").disabled = false;
                isPanVerified = false;
                alert("PAN verification failed. Please check the PAN.");
            }
        }

        function checkForDuplicates() {
            const duplicateGSTINs = ["27AABCU9603R1ZM"];
            const duplicatePANs = ["AABCU9603R"];
            const isDuplicate = (formData.gstin && duplicateGSTINs.includes(formData.gstin)) || (formData.pan && duplicatePANs.includes(formData.pan));
            if (isDuplicate && isGstinVerified && isPanVerified) {
                document.getElementById("duplicateWarning").style.display = "flex";
                document.getElementById("duplicateTable").style.display = "table";
                document.getElementById("reasonField").style.display = "block";
            } else {
                document.getElementById("duplicateWarning").style.display = "none";
                document.getElementById("duplicateTable").style.display = "none";
                document.getElementById("reasonField").style.display = "none";
                if (isGstinVerified && isPanVerified) document.getElementById("proceedButton").disabled = false;
            }
        }

        function updateProceedButton() {
            const selectedVendor = document.querySelector("input[name='duplicateVendor']:checked");
            const reason = document.getElementById("duplicateReason").value.trim();
            const differentAddress = document.querySelector("input[name='differentAddress']:checked");
            formData.duplicateVendor = selectedVendor ? selectedVendor.value : "";
            formData.duplicateReason = reason;
            formData.differentAddress = differentAddress ? differentAddress.value : "";
            if (formData.duplicateVendor && reason && differentAddress) {
                document.getElementById("proceedButton").disabled = false;
                document.getElementById("duplicateReasonError").style.display = "none";
            } else {
                document.getElementById("proceedButton").disabled = true;
                if (!reason) document.getElementById("duplicateReasonError").style.display = "block";
                else document.getElementById("duplicateReasonError").style.display = "none";
            }
        }

        function proceed() {
            if (!isGstinVerified || !isPanVerified) {
                alert("Please verify both GSTIN and PAN before proceeding.");
                return;
            }
            const duplicateWarningVisible = document.getElementById("duplicateWarning").style.display === "flex";
            if (duplicateWarningVisible && (!formData.duplicateVendor || !formData.duplicateReason || !formData.differentAddress)) {
                alert("Please complete the duplicate vendor details before proceeding.");
                return;
            }
            formData.address = document.getElementById("address").value.trim();
            formData.isVerified = true;
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ type: "NEW_SUPPLIER", data: formData }, "*");
            }
            alert("New Supplier Request created successfully!");
            window.close();
        }

        function cancel() {
            if (confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) window.close();
        }

        updateStepIndicator();
    </script>
</body>
</html>
            `;

            var newWindow = window.open("", "_blank");
            if (newWindow) {
                newWindow.document.write(sHtmlContent);
                newWindow.document.close();
                window.addEventListener("message", (event) => {
                    if (event.data.type === "NEW_SUPPLIER") this._handleNewSupplier(event.data.data);
                }, { once: true });
            } else {
                MessageToast.show("Failed to open new tab. Please allow pop-ups for this site.");
            }
        },

        _handleNewSupplier: function (formData) {
            var oModel = this.getView().getModel("products");
            var oData = oModel.getData();
            var aItems = oData.items;

            var iLastId = Math.max(...aItems.map(item => parseInt(item.supplierRequestId.replace("R", ""), 10)));
            var sNewId = "R" + (iLastId + 1).toString().padStart(2, "0");

            var oDate = new Date();
            var sCurrentDate = `${oDate.getDate().toString().padStart(2, "0")}-${(oDate.getMonth() + 1).toString().padStart(2, "0")}-${oDate.getFullYear()}`;

            var oNewSupplier = {
                supplierRequestId: sNewId,
                supplierName: formData.supplierFullLegalName || "New Supplier " + sNewId,
                type: formData.spendType,
                requestCreationDate: sCurrentDate,
                requestAging: "0 Days",
                lastActionDate: sCurrentDate,
                lastActionAging: "0 Days",
                stage: "SUPPLIER",
                status: "DRAFT",
                attachments: formData.attachments || []
            };

            aItems.unshift(oNewSupplier);
            this._updateTileCounts(oData);
            oModel.setData(oData);
            this._originalItems = JSON.parse(JSON.stringify(oData.items));
            this._refreshTable();
            this.openDetailedSupplierForm(formData);
            MessageToast.show(`New Supplier Request created successfully! ID: ${sNewId}`);
        },

        onDownloadPress: function () {
            var oModel = this.getView().getModel("products");
            var aItems = oModel.getProperty("/items");

            if (!aItems || !aItems.length) {
                MessageToast.show("No data to download.");
                return;
            }

            var aHeaders = ["Supplier Request ID", "Supplier Name", "Type", "Request Creation Date", "Request Aging", "Last Action Date", "Last Action Aging", "Stage", "Status", "Attachments"];
            var aRows = aItems.map(oItem => [
                oItem.supplierRequestId,
                oItem.supplierName,
                oItem.type,
                oItem.requestCreationDate,
                oItem.requestAging,
                oItem.lastActionDate,
                oItem.lastActionAging,
                oItem.stage,
                oItem.status,
                oItem.attachments ? oItem.attachments.map(a => a.fileName).join(", ") : ""
            ].map(sValue => `"${(sValue || "").replace(/"/g, '""')}"`).join(","));

            var sCSVContent = aHeaders.join(",") + "\n" + aRows.join("\n");
            var oBlob = new Blob([sCSVContent], { type: "text/csv;charset=utf-8;" });
            var sURL = window.URL.createObjectURL(oBlob);

            var oLink = document.createElement("a");
            oLink.href = sURL;
            oLink.download = "Supplier_Registration_Data.csv";
            document.body.appendChild(oLink);
            oLink.click();
            document.body.removeChild(oLink);
            MessageToast.show("Table data downloaded as CSV.");
        },

        onResetSort: function () {
            Object.keys(this._sortStates).forEach(sKey => {
                this._sortStates[sKey] = false;
                this._updateSortIcon(sKey, false);
            });

            var oModel = this.getView().getModel("products");
            oModel.setProperty("/items", JSON.parse(JSON.stringify(this._originalItems)));
            this._centerTiles();
            this._refreshTable();
            MessageToast.show("Sort state reset to original.");
        }
    });
});







UPDATE DATA 1

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter", 
    "sap/ui/core/Item"
], function (Controller, JSONModel, MessageBox, MessageToast, Filter, FilterOperator, Sorter, Item) {
    "use strict";

    return Controller.extend("com.tableentry.tablestructure.controller.Table_Entry", {
        onInit: function () {
            // Initial data for the table
            var oData = {
                items: [
                    { supplierRequestId: "R35", supplierName: "ABC Pvt Ltd", type: "Direct", requestCreationDate: "12-01-2024", requestAging: "10 Days", lastActionDate: "11-10-2024", lastActionAging: "15 Days", stage: "SUPPLIER", status: "PENDING" },
                    { supplierRequestId: "R18", supplierName: "XYZ Pvt Ltd", type: "Indirect", requestCreationDate: "12-02-2024", requestAging: "20 Days", lastActionDate: "12-10-2024", lastActionAging: "20 Days", stage: "SUPPLIER", status: "PENDING" },
                    { supplierRequestId: "R17", supplierName: "ABC Pvt Ltd", type: "Direct", requestCreationDate: "12-03-2024", requestAging: "30 Days", lastActionDate: "13-10-2024", lastActionAging: "30 Days", stage: "BUYER", status: "DRAFT" },
                    { supplierRequestId: "R16", supplierName: "XYZ Pvt Ltd", type: "Indirect", requestCreationDate: "12-04-2024", requestAging: "40 Days", lastActionDate: "14-10-2024", lastActionAging: "40 Days", stage: "BUYER", status: "CANCELLED" },
                    { supplierRequestId: "R15", supplierName: "ABC Pvt Ltd", type: "Direct", requestCreationDate: "12-05-2024", requestAging: "50 Days", lastActionDate: "15-10-2024", lastActionAging: "50 Days", stage: "ON BOARDING", status: "VENDOR CREATED" },
                    { supplierRequestId: "R14", supplierName: "ABC Pvt Ltd", type: "Direct", requestCreationDate: "12-06-2024", requestAging: "60 Days", lastActionDate: "16-10-2024", lastActionAging: "25 Days", stage: "ON BOARDING", status: "CMDM UPDATE PENDING" },
                    { supplierRequestId: "R13", supplierName: "ABC Pvt Ltd", type: "Indirect", requestCreationDate: "12-07-2024", requestAging: "70 Days", lastActionDate: "17-10-2024", lastActionAging: "35 Days", stage: "ON BOARDING", status: "FINANCE UPDATE PENDING" },
                    { supplierRequestId: "R12", supplierName: "XYZ Pvt Ltd", type: "Indirect", requestCreationDate: "12-08-2024", requestAging: "80 Days", lastActionDate: "18-10-2024", lastActionAging: "55 Days", stage: "ON BOARDING", status: "PURCHASE APPROVAL PENDING" },
                    { supplierRequestId: "R11", supplierName: "XYZ Pvt Ltd", type: "Indirect", requestCreationDate: "12-09-2024", requestAging: "90 Days", lastActionDate: "19-10-2024", lastActionAging: "45 Days", stage: "BUYER", status: "DRAFT" },
                    { supplierRequestId: "R10", supplierName: "XYZ Pvt Ltd", type: "Direct", requestCreationDate: "12-10-2024", requestAging: "100 Days", lastActionDate: "20-10-2024", lastActionAging: "75 Days", stage: "BUYER", status: "APPROVED" },
                    { supplierRequestId: "R9", supplierName: "XYZ Pvt Ltd", type: "Direct", requestCreationDate: "12-11-2024", requestAging: "110 Days", lastActionDate: "21-10-2024", lastActionAging: "65 Days", stage: "BUYER", status: "DRAFT" }
                ],
                draftCount: 0,
                myPendingCount: 0,
                pendingWithSupplierCount: 0,
                onBoardingCount: 0,
                allCount: 0
            };

            // Initialize sort states
            this._sortStates = {
                supplierRequestId: false,
                supplierName: false,
                type: false,
                requestCreationDate: false,
                requestAging: false,
                lastActionDate: false,
                lastActionAging: false,
                stage: false,
                status: false
            };

            // Store original items for reset
            this._originalItems = JSON.parse(JSON.stringify(oData.items));
            this._updateTileCounts(oData);

            // Set main model
            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "products");

            // Initialize new supplier model
            var oNewSupplierData = {
                spendType: "",
                supplierType: "",
                gstin: "",
                pan: "",
                address: "",
                isVerified: false,
                currentStep: 1,
                justification: "",
                primaryContactName: "",
                primaryContactNumber: "",
                primaryContactEmail: "",
                isExistingSupplier: false,
                existingSupplierCode: "",
                isDifferentAddress: false,
                differentAddress: "",
                purchasingOrg: "",
                paymentTerms: "",
                vendorCodeCreationType: "",
                buyerRequesting: "",
                isRelatedParty: false,
                businessJustification: "",
                additionalComments: "",
                attachments: [],
                safeNetworks: "",
                serviceSupplierChannel: "",
                broadcastInformationTechnology: "",
                additionsInformation: "",
                supportControl: ""
            };
            var oNewSupplierModel = new JSONModel(oNewSupplierData);
            this.getView().setModel(oNewSupplierModel, "newSupplier");

            // Initialize verification model
            var oVerificationData = {
                gstin: "",
                pan: "",
                isVerified: false,
                duplicateVendor: {
                    V0001: false,
                    V0002: false,
                    V0003: false
                },
                duplicateReason: "",
                differentAddress: ""
            };
            var oVerificationModel = new JSONModel(oVerificationData);
            this.getView().setModel(oVerificationModel, "verification");

            this._addCustomCSS();
        },

        _addCustomCSS: function () {
            var sStyle = `
                /* Combined CSS from both implementations */
                .form-container { 
                    padding: 20px; 
                    max-width: 800px; 
                    margin: 20px auto; 
                    border: 1px solid #d9d9d9; 
                    border-radius: 8px; 
                    background-color: #fff; 
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
                }
                .header { 
                    background-color: #ff0000; 
                    color: #fff; 
                    padding: 10px; 
                    text-align: center; 
                    border-top-left-radius: 8px; 
                    border-top-right-radius: 8px; 
                    font-size: 18px; 
                    font-weight: bold; 
                }
                .panel { 
                    border: 1px solid #d9d9d9; 
                    border-radius: 4px; 
                    padding: 15px; 
                    margin-top: 10px; 
                    background-color: #f9f9f9; 
                }
                .step-indicator { 
                    display: flex; 
                    align-items: center; 
                    margin-bottom: 20px; 
                    justify-content: center; 
                }
                .step-number { 
                    width: 20px; 
                    height: 20px; 
                    border-radius: 50%; 
                    text-align: center; 
                    line-height: 20px; 
                    font-size: 12px; 
                    margin-right: 5px; 
                }
                .step-text { 
                    font-size: 12px; 
                    line-height: 20px; 
                    margin-right: 10px; 
                }
                .step-gap { 
                    width: 20px; 
                    height: 2px; 
                    background-color: #d3d3d3; 
                    margin: 0 5px; 
                }
                .inactive-step { 
                    background-color: #d3d3d3; 
                    color: #666; 
                }
                .active-step { 
                    background-color: #ff0000; 
                    color: #fff; 
                }
                .active-step.step-text { 
                    background-color: transparent; 
                    color: #000; 
                    font-weight: bold; 
                }
                .form-field { 
                    margin-bottom: 15px; 
                }
                .form-field label { 
                    display: block; 
                    font-weight: bold; 
                    margin-bottom: 5px; 
                }
                .form-field input, 
                .form-field textarea, 
                .form-field select { 
                    width: 100%; 
                    padding: 8px; 
                    border: 1px solid #d9d9d9; 
                    border-radius: 4px; 
                    box-sizing: border-box; 
                }
                .form-field .input-with-button { 
                    display: flex; 
                    align-items: center; 
                    gap: 10px; 
                }
                .form-field button { 
                    padding: 8px 16px; 
                    background-color: #0070f0; 
                    color: #fff; 
                    border: none; 
                    border-radius: 4px; 
                    cursor: pointer; 
                }
                .form-field button:disabled { 
                    background-color: #d3d3d3; 
                    cursor: not-allowed; 
                }
                .form-field .verified { 
                    background-color: #28a745; 
                }
                .buttons { 
                    display: flex; 
                    justify-content: flex-end; 
                    gap: 15px; 
                    margin-top: 20px; 
                }
                .buttons button { 
                    padding: 8px 16px; 
                    border-radius: 4px; 
                    cursor: pointer; 
                }
                .buttons .proceed { 
                    background-color: #0070f0; 
                    color: #fff; 
                    border: none; 
                }
                .buttons .cancel { 
                    background-color: #fff; 
                    color: #ff0000; 
                    border: 1px solid #ff0000; 
                }
                .buttons .previous { 
                    background-color: #fff; 
                    color: #000; 
                    border: 1px solid #d9d9d9; 
                }
                .error { 
                    border-color: #ff0000 !important; 
                }
                .error-message { 
                    color: #ff0000; 
                    font-size: 12px; 
                    margin-top: 5px; 
                }
                .duplicate-warning { 
                    color: #ff0000; 
                    margin-bottom: 15px; 
                    display: flex; 
                    align-items: center; 
                }
                .duplicate-warning::before { 
                    content: "⚠️"; 
                    margin-right: 5px; 
                }
                .duplicate-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-bottom: 15px; 
                }
                .duplicate-table th, 
                .duplicate-table td { 
                    border: 1px solid #d9d9d9; 
                    padding: 8px; 
                    text-align: left; 
                }
                .duplicate-table th { 
                    background-color: #f7f7f7; 
                }
                .duplicate-table input[type="radio"] { 
                    margin-right: 5px; 
                }
                .reason-field { 
                    margin-top: 10px; 
                }
                .field-container { 
                    display: flex; 
                    align-items: center; 
                    margin-bottom: 10px; 
                }
                .field-container label { 
                    margin-bottom: 0; 
                }
                .radio-group { 
                    display: inline-flex; 
                    align-items: center; 
                    gap: 10px; 
                }
                .radio-group input[type="radio"] { 
                    margin: 0 5px 0 0; 
                }
                .radio-group label { 
                    font-weight: normal; 
                    margin: 0; 
                }
                
                /* Table styling */
                .sapMListTbl .sapMListTblHeaderCell {
                    text-align: center !important;
                    vertical-align: middle !important;
                }
                
                .sort-button-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                }
                
                .sort-button {
                    margin: 0 4px;
                    padding: 4px 8px;
                    min-width: 32px;
                }
                
                /* ObjectPage styling */
                .objectPageHeader {
                    text-align: center !important;
                }
                
                .objectPageHeader .sapUxAPObjectPageHeaderTitle {
                    text-align: center !important;
                    justify-content: center !important;
                }
                
                /* Networked sections styling */
                .networked-section {
                    background-color: #f5f5f5;
                    border: 1px solid #d9d9d9;
                    border-radius: 4px;
                    margin-bottom: 16px;
                    padding: 12px;
                }
                
                .networked-section-header {
                    font-weight: bold;
                    font-size: 14px;
                    color: #333;
                    margin-bottom: 8px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .networked-item {
                    display: flex;
                    align-items: center;
                    padding: 8px 0;
                    border-bottom: 1px solid #eee;
                }
                
                .networked-item:last-child {
                    border-bottom: none;
                }
                
                .networked-label {
                    font-weight: bold;
                    min-width: 200px;
                }
                
                .networked-value {
                    flex-grow: 1;
                }
                
                /* Form styling */
                .form-section {
                    margin-bottom: 24px;
                    border: 1px solid #d9d9d9;
                    border-radius: 4px;
                    padding: 16px;
                    background-color: #f9f9f9;
                }
                
                .form-section-title {
                    font-weight: bold;
                    font-size: 16px;
                    color: #333;
                    margin-bottom: 12px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid #d9d9d9;
                }
                
                .form-field-row {
                    display: flex;
                    margin-bottom: 12px;
                }
                
                .form-field {
                    flex: 1;
                    margin-right: 16px;
                }
                
                .form-field:last-child {
                    margin-right: 0;
                }
                
                .form-field label {
                    display: block;
                    font-weight: bold;
                    margin-bottom: 4px;
                    color: #666;
                }
                
                .required-field label::after {
                    content: " *";
                    color: #f00;
                }
                
                /* Purchasing Data section styling */
                .purchasing-data-section {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                }
                
                .purchasing-data-field {
                    flex: 1;
                    min-width: 200px;
                }
                
                /* Additional Information section styling */
                .additional-info-section {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                
                /* Footer buttons styling */
                .objectPageFooter {
                    display: flex;
                    justify-content: flex-end;
                    padding: 16px;
                    background-color: #f9f9f9;
                    border-top: 1px solid #d9d9d9;
                    position: sticky;
                    bottom: 0;
                }
                
                .footer-button {
                    margin-left: 8px;
                }
                
                /* Upload collection styling */
                .attachment-count {
                    font-weight: bold;
                    color: #0070f0;
                }
            `;
            var oStyle = document.createElement("style");
            oStyle.type = "text/css";
            oStyle.innerHTML = sStyle;
            document.getElementsByTagName("head")[0].appendChild(oStyle);
        },

        onVerifyGSTINAndPAN: function () {
            var oVerificationModel = this.getView().getModel("verification");
            var oGstinInput = this.byId("gstinInput");
            var oPanInput = this.byId("panInput");
            var oVerifyButton = this.byId("verifyButton");

            var sGstin = oGstinInput.getValue().trim();
            var sPan = oPanInput.getValue().trim();

            // GSTIN validation
            const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!sGstin) {
                oGstinInput.setValueState("Error").setValueStateText("GSTIN No. is required.");
                return;
            } else if (!gstinRegex.test(sGstin)) {
                oGstinInput.setValueState("Error").setValueStateText("Invalid GSTIN format (e.g., 27AABCU9603R1ZM,28BBCOP4651EZ89,11WEXYQ0982IT,).");
                return;
            } else {
                oGstinInput.setValueState("None");
            }

            // PAN validation
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (!sPan) {
                oPanInput.setValueState("Error").setValueStateText("PAN Card No. is required.");
                return;
            } else if (!panRegex.test(sPan)) {
                oPanInput.setValueState("Error").setValueStateText("Invalid PAN format (e.g., AABCU9603R).");
                return;
            } else {
                oPanInput.setValueState("None");
            }

            // Check against valid credentials
            const validCredentials = [
                { gstin: "27AABCU9603R1ZM", pan: "AABCU9603R" },
                { gstin: "29AAGCM1234P1ZT", pan: "AAGCM1234P" },
                { gstin: "33AAHCP7890N1ZF", pan: "AAHCP7890N" }
            ];

            const isValid = validCredentials.some(cred => cred.gstin === sGstin && cred.pan === sPan);

            if (isValid) {
                oVerifyButton.setText("Verified").addStyleClass("verified").setEnabled(false);
                oVerificationModel.setData({ isVerified: true, gstin: sGstin, pan: sPan });
                MessageToast.show("GSTIN and PAN verified successfully!");
                this.openDetailedSupplierForm({ gstin: sGstin, pan: sPan });
            } else {
                oVerifyButton.setText("Verify").removeStyleClass("verified").setEnabled(true);
                oVerificationModel.setProperty("/isVerified", false);
                MessageToast.show("Verification failed. Please check the GSTIN and PAN.");
            }
        },

        openDetailedSupplierForm: function (formData) {
            var sGstin = typeof formData === "object" ? formData.gstin : formData;
            var sPan = typeof formData === "object" ? formData.pan : formData;
            var sSpendType = formData.spendType || "";
            var sSupplierType = formData.supplierType || "";
            var sJustification = formData.justification || "";
            var sAddress = formData.address || "";
            var sPrimaryContactName = formData.primaryContactName || "";
            var sPrimaryContactNumber = formData.primaryContactNumber || "";
            var sPrimaryContactEmail = formData.primaryContactEmail || "";
            var sPurchasingOrg = formData.purchasingOrg || "";
            var sPaymentTerms = formData.paymentTerms || "";
            var bIsExistingSupplier = formData.isExistingSupplier || false;
            var sExistingSupplierCode = formData.existingSupplierCode || "";
            var bIsDifferentAddress = formData.isDifferentAddress || false;
            var sDifferentAddress = formData.differentAddress || "";
            var sVendorCodeCreationType = formData.vendorCodeCreationType || "";
            var sBuyerRequesting = formData.buyerRequesting || "";
            var bIsRelatedParty = formData.isRelatedParty || false;
            var sBusinessJustification = formData.businessJustification || "";
            var sAdditionalComments = formData.additionalComments || "";
            var aAttachments = formData.attachments || [];
            var sSafeNetworks = formData.safeNetworks || "";
            var sServiceSupplierChannel = formData.serviceSupplierChannel || "";
            var sBroadcastInformationTechnology = formData.broadcastInformationTechnology || "";
            var sAdditionsInformation = formData.additionsInformation || "";
            var sSupportControl = formData.supportControl || "";

            var sHtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Supplier Request Form</title>
    <link rel="stylesheet" href="https://sapui5.hana.ondemand.com/resources/sap/ui/core/themes/sap_fiori_3/library.css">
    <link rel="stylesheet" href="https://sapui5.hana.ondemand.com/resources/sap/m/themes/sap_fiori_3/library.css">
    <link rel="stylesheet" href="https://sapui5.hana.ondemand.com/resources/sap/uxap/themes/sap_fiori_3/library.css">
    <script src="https://sapui5.hana.ondemand.com/resources/sap-ui-core.js"
        id="sap-ui-bootstrap"
        data-sap-ui-libs="sap.m, sap.uxap, sap.ui.layout"
        data-sap-ui-theme="sap_fiori_3"
        data-sap-ui-compatVersion="edge"
        data-sap-ui-async="true">
    </script>
    <style>
        .objectPageHeader {
            text-align: center !important;
        }
        
        .objectPageHeader .sapUxAPObjectPageHeaderTitle {
            text-align: center !important;
            justify-content: center !important;
        }
        
        /* Networked sections styling */
        .networked-section {
            background-color: #f5f5f5;
            border: 1px solid #d9d9d9;
            border-radius: 4px;
            margin-bottom: 16px;
            padding: 12px;
        }
        
        .networked-section-header {
            font-weight: bold;
            font-size: 14px;
            color: #333;
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .networked-item {
            display: flex;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        
        .networked-item:last-child {
            border-bottom: none;
        }
        
        .networked-label {
            font-weight: bold;
            min-width: 200px;
        }
        
        .networked-value {
            flex-grow: 1;
        }
        
        /* Purchasing Data section styling */
        .purchasing-data-section {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
        }
        
        .purchasing-data-field {
            flex: 1;
            min-width: 200px;
        }
        
        /* Additional Information section styling */
        .additional-info-section {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        
        /* Footer buttons styling */
        .objectPageFooter {
            display: flex;
            justify-content: flex-end;
            padding: 16px;
            background-color: #f9f9f9;
            border-top: 1px solid #d9d9d9;
            position: sticky;
            bottom: 0;
        }
        
        .footer-button {
            margin-left: 8px;
        }
        
        /* Upload collection styling */
        .attachment-count {
            font-weight: bold;
            color: #0070f0;
        }
    </style>
</head>
<body>
    <div id="content"></div>
    <script>
        sap.ui.getCore().attachInit(function () {
            var oUploadCollection = new sap.m.UploadCollection({
                multiple: true,
                uploadEnabled: true,
                fileDeleted: function(oEvent) {
                    updateAttachmentCount();
                },
                uploadComplete: function(oEvent) {
                    updateAttachmentCount();
                },
                items: {
                    path: "/attachments",
                    template: new sap.m.UploadCollectionItem({
                        fileName: "{fileName}"
                    })
                }
            });
            
            function updateAttachmentCount() {
                var iCount = oUploadCollection.getItems().length;
                var oAttachmentCount = sap.ui.getCore().byId("attachmentCount");
                if (oAttachmentCount) {
                    oAttachmentCount.setText("(" + iCount + ")");
                }
            }
            
            var oModel = new sap.ui.model.json.JSONModel({
                attachments: ${JSON.stringify(aAttachments)},
                formData: {
                    gstin: "${sGstin}",
                    pan: "${sPan}",
                    spendType: "${sSpendType}",
                    supplierType: "${sSupplierType}",
                    primaryContactName: "${sPrimaryContactName}",
                    primaryContactNumber: "${sPrimaryContactNumber}",
                    primaryContactEmail: "${sPrimaryContactEmail}",
                    purchasingOrg: "${sPurchasingOrg}",
                    paymentTerms: "${sPaymentTerms}",
                    vendorCodeCreationType: "${sVendorCodeCreationType}",
                    buyerRequesting: "${sBuyerRequesting}",
                    isRelatedParty: ${bIsRelatedParty},
                    businessJustification: "${sBusinessJustification}",
                    additionalComments: "${sAdditionalComments}",
                    safeNetworks: "${sSafeNetworks}",
                    serviceSupplierChannel: "${sServiceSupplierChannel}",
                    broadcastInformationTechnology: "${sBroadcastInformationTechnology}",
                    additionsInformation: "${sAdditionsInformation}",
                    supportControl: "${sSupportControl}"
                }
            });
            
            sap.ui.getCore().setModel(oModel);
            
            new sap.m.App({
                pages: [
                    new sap.uxap.ObjectPageLayout({
                        headerTitle: new sap.uxap.ObjectPageHeader({
                            objectTitle: "NEW SUPPLIER REQUEST FORM",
                            objectSubtitle: "",
                            headerDesign: "Dark",
                            isObjectIconAlwaysVisible: false
                        }).addStyleClass("objectPageHeader"),
                        sections: [
                            // Supplier Identification section
                            new sap.uxap.ObjectPageSection({
                                title: "Supplier Identification",
                                titleUppercase: false,
                                subSections: [
                                    new sap.uxap.ObjectPageSubSection({
                                        blocks: [
                                            new sap.ui.layout.form.SimpleForm({
                                                editable: true,
                                                layout: "ResponsiveGridLayout",
                                                labelSpanL: 4,
                                                labelSpanM: 4,
                                                labelSpanS: 12,
                                                content: [
                                                    new sap.m.Label({ text: "Supplier Spend Type:", design: "Bold", required: true }),
                                                    new sap.m.Select({
                                                        width: "100%",
                                                        items: [
                                                            new sap.ui.core.Item({ key: "", text: "Select" }),
                                                            new sap.ui.core.Item({ key: "Direct", text: "Direct" }),
                                                            new sap.ui.core.Item({ key: "Indirect", text: "Indirect" }),
                                                            new sap.ui.core.Item({ key: "Capital", text: "Capital" })
                                                        ],
                                                        selectedKey: "${sSpendType}"
                                                    }),
                                                    new sap.m.Label({ text: "Supplier Type:", design: "Bold", required: true }),
                                                    new sap.m.Select({
                                                        width: "100%",
                                                        items: [
                                                            new sap.ui.core.Item({ key: "", text: "Select" }),
                                                            new sap.ui.core.Item({ key: "LOCAL GST", text: "LOCAL GST" }),
                                                            new sap.ui.core.Item({ key: "LOCAL NON-GST", text: "LOCAL NON-GST" }),
                                                            new sap.ui.core.Item({ key: "IMPORT", text: "IMPORT" })
                                                        ],
                                                        selectedKey: "${sSupplierType}"
                                                    }),
                                                    new sap.m.Label({ text: "Nature of Activity:", design: "Bold", required: true }),
                                                    new sap.m.Select({
                                                        width: "100%",
                                                        items: [
                                                            new sap.ui.core.Item({ key: "", text: "Select" }),
                                                            new sap.ui.core.Item({ key: "Manufacturing", text: "Manufacturing" }),
                                                            new sap.ui.core.Item({ key: "Service", text: "Service" }),
                                                            new sap.ui.core.Item({ key: "Trading", text: "Trading" })
                                                        ]
                                                    }),
                                                    new sap.m.Label({ text: "Sector:", design: "Bold", required: true }),
                                                    new sap.m.Select({
                                                        width: "100%",
                                                        items: [
                                                            new sap.ui.core.Item({ key: "", text: "Select" }),
                                                            new sap.ui.core.Item({ key: "Public", text: "Public" }),
                                                            new sap.ui.core.Item({ key: "Private", text: "Private" })
                                                        ]
                                                    }),
                                                    new sap.m.Label({ text: "Department:", design: "Bold", required: true }),
                                                    new sap.m.Select({
                                                        width: "100%",
                                                        items: [
                                                            new sap.ui.core.Item({ key: "", text: "Select" }),
                                                            new sap.ui.core.Item({ key: "Finance", text: "Finance" }),
                                                            new sap.ui.core.Item({ key: "HR", text: "HR" }),
                                                            new sap.ui.core.Item({ key: "IT", text: "IT" })
                                                        ]
                                                    }),
                                                    new sap.m.Label({ text: "Function & Subfunction:", design: "Bold", required: true }),
                                                    new sap.m.Select({
                                                        width: "100%",
                                                        items: [
                                                            new sap.ui.core.Item({ key: "", text: "Select" }),
                                                            new sap.ui.core.Item({ key: "Procurement", text: "Procurement" }),
                                                            new sap.ui.core.Item({ key: "Logistics", text: "Logistics" })
                                                        ]
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }),
                            
                            // General Supplier Information section (as in Capture 19)
                            new sap.uxap.ObjectPageSection({
                                title: "General Supplier Information",
                                titleUppercase: false,
                                subSections: [
                                    new sap.uxap.ObjectPageSubSection({
                                        blocks: [
                                            new sap.ui.core.HTML({
                                                content: \`
                                                    <div class="networked-section">
                                                        <div class="networked-section-header">Safe Networks</div>
                                                        <div class="networked-item">
                                                            <div class="networked-label">Networked</div>
                                                            <div class="networked-value">${sSafeNetworks || "Networked"}</div>
                                                        </div>
                                                        <div class="networked-item">
                                                            <div class="networked-label">Networked</div>
                                                            <div class="networked-value">${sSafeNetworks || "Networked"}</div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div class="networked-section">
                                                        <div class="networked-section-header">Service Supplier Channel</div>
                                                        <div class="networked-item">
                                                            <div class="networked-label">Networked</div>
                                                            <div class="networked-value">${sServiceSupplierChannel || "Networked"}</div>
                                                        </div>
                                                        <div class="networked-item">
                                                            <div class="networked-label">Networked</div>
                                                            <div class="networked-value">${sServiceSupplierChannel || "Networked"}</div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div class="networked-section">
                                                        <div class="networked-section-header">Service Supplier Channel Supply Information</div>
                                                        <div class="networked-item">
                                                            <div class="networked-label">Networked</div>
                                                            <div class="networked-value">${sServiceSupplierChannel || "Networked"}</div>
                                                        </div>
                                                        <div class="networked-item">
                                                            <div class="networked-label">Networked</div>
                                                            <div class="networked-value">${sServiceSupplierChannel || "Networked"}</div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div class="networked-section">
                                                        <div class="networked-section-header">On - Be</div>
                                                        <div class="networked-item">
                                                            <div class="networked-label">On - Be</div>
                                                            <div class="networked-value">${sAdditionsInformation || "On - Be"}</div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div class="networked-section">
                                                        <div class="networked-section-header">Be - On</div>
                                                        <div class="networked-item">
                                                            <div class="networked-label">On - Be</div>
                                                            <div class="networked-value">${sAdditionsInformation || "On - Be"}</div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div class="networked-section">
                                                        <div class="networked-section-header">Broadcast Information Technology</div>
                                                        <div class="networked-item">
                                                            <div class="networked-label">Networked</div>
                                                            <div class="networked-value">${sBroadcastInformationTechnology || "Networked"}</div>
                                                        </div>
                                                        <div class="networked-item">
                                                            <div class="networked-label">Networked</div>
                                                            <div class="networked-value">${sBroadcastInformationTechnology || "Networked"}</div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div class="networked-section">
                                                        <div class="networked-section-header">Additions Information</div>
                                                        <div class="networked-item">
                                                            <div class="networked-label">On - On</div>
                                                            <div class="networked-value">${sAdditionsInformation || "On - On"}</div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div class="networked-section">
                                                        <div class="networked-section-header">Support Control</div>
                                                        <div class="networked-item">
                                                            <div class="networked-label">Networked</div>
                                                            <div class="networked-value">${sSupportControl || "Networked"}</div>
                                                        </div>
                                                        <div class="networked-item">
                                                            <div class="networked-label">Networked</div>
                                                            <div class="networked-value">${sSupportControl || "Networked"}</div>
                                                        </div>
                                                    </div>
                                                \`
                                            })
                                        ]
                                    })
                                ]
                            }),
                            
                            // Purchasing Data section (as in Capture 1.0)
                            new sap.uxap.ObjectPageSection({
                                title: "Purchasing Data",
                                titleUppercase: false,
                                subSections: [
                                    new sap.uxap.ObjectPageSubSection({
                                        blocks: [
                                            new sap.ui.core.HTML({
                                                content: \`
                                                    <div class="purchasing-data-section">
                                                        <div class="purchasing-data-field">
                                                            <label>Purchasing Organization</label>
                                                            <input type="text" value="${sPurchasingOrg}" style="width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px;">
                                                        </div>
                                                        <div class="purchasing-data-field">
                                                            <label>Payment Terms</label>
                                                            <input type="text" value="${sPaymentTerms}" style="width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px;">
                                                        </div>
                                                        <div class="purchasing-data-field">
                                                            <label>Different Address?</label>
                                                            <div style="display: flex; gap: 16px; margin-top: 8px;">
                                                                <label><input type="radio" name="differentAddress" ${bIsDifferentAddress ? "checked" : ""}> Yes</label>
                                                                <label><input type="radio" name="differentAddress" ${!bIsDifferentAddress ? "checked" : ""}> No</label>
                                                            </div>
                                                        </div>
                                                        <div class="purchasing-data-field">
                                                            <label>Different Address</label>
                                                            <textarea style="width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px; height: 60px;">${sDifferentAddress}</textarea>
                                                        </div>
                                                    </div>
                                                \`
                                            })
                                        ]
                                    })
                                ]
                            }),
                            
                            // Additional Information section (as in Capture 1.0)
                            new sap.uxap.ObjectPageSection({
                                title: "Additional Information",
                                titleUppercase: false,
                                subSections: [
                                    new sap.uxap.ObjectPageSubSection({
                                        blocks: [
                                            new sap.ui.core.HTML({
                                                content: \`
                                                    <div class="additional-info-section">
                                                        <div>
                                                            <label>Business Justification for New Supplier:</label>
                                                            <textarea style="width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px; height: 80px;">${sBusinessJustification}</textarea>
                                                        </div>
                                                        <div>
                                                            <label>Additional Comments:</label>
                                                            <textarea style="width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px; height: 80px;">${sAdditionalComments}</textarea>
                                                        </div>
                                                        <div>
                                                            <label>Attachments <span id="attachmentCount" class="attachment-count">(${aAttachments.length})</span>:</label>
                                                        </div>
                                                    </div>
                                                \`
                                            }),
                                            oUploadCollection
                                        ]
                                    })
                                ]
                            })
                        ],
                        footer: new sap.m.Toolbar({
                            content: [
                                new sap.m.ToolbarSpacer(),
                                new sap.m.Button({
                                    text: "Save",
                                    type: "Accept",
                                    press: function () {
                                        var oModel = sap.ui.getCore().getModel();
                                        var oFormData = oModel.getProperty("/formData");
                                        
                                        // Get values from form
                                        oFormData.purchasingOrg = document.querySelector(".purchasing-data-section input[type='text']").value;
                                        oFormData.paymentTerms = document.querySelectorAll(".purchasing-data-section input[type='text']")[1].value;
                                        oFormData.isDifferentAddress = document.querySelector(".purchasing-data-section input[type='radio']").checked;
                                        oFormData.differentAddress = document.querySelector(".purchasing-data-section textarea").value;
                                        oFormData.businessJustification = document.querySelectorAll(".additional-info-section textarea")[0].value;
                                        oFormData.additionalComments = document.querySelectorAll(".additional-info-section textarea")[1].value;
                                        
                                        // Get attachments
                                        var aAttachments = [];
                                        oUploadCollection.getItems().forEach(function(oItem) {
                                            aAttachments.push({
                                                fileName: oItem.getFileName()
                                            });
                                        });
                                        oFormData.attachments = aAttachments;
                                        
                                        oModel.setProperty("/formData", oFormData);
                                        
                                        // In a real app, you would send this data to the backend
                                        sap.m.MessageToast.show("Supplier Request Form saved successfully!");
                                        
                                        // Post message back to parent window
                                        if (window.opener && !window.opener.closed) {
                                            window.opener.postMessage({
                                                type: "SUPPLIER_FORM_SAVED",
                                                data: oFormData
                                            }, "*");
                                        }
                                    }
                                }).addStyleClass("footer-button"),
                                new sap.m.Button({
                                    text: "Cancel",
                                    type: "Reject",
                                    press: function () {
                                        if (confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
                                            window.close();
                                        }
                                    }
                                }).addStyleClass("footer-button"),
                                new sap.m.Button({
                                    text: "Download",
                                    press: function () {
                                        // Create CSV content
                                        var oFormData = sap.ui.getCore().getModel().getProperty("/formData");
                                        var sCSVContent = "Field,Value\\n";
                                        
                                        for (var sKey in oFormData) {
                                            if (typeof oFormData[sKey] !== "object" || sKey === "attachments") {
                                                var sValue = Array.isArray(oFormData[sKey]) ? 
                                                    oFormData[sKey].map(function(oItem) { return oItem.fileName; }).join(", ") : 
                                                    oFormData[sKey];
                                                sCSVContent += \`"\${sKey}","\${sValue}"\\n\`;
                                            }
                                        }
                                        
                                        // Create download link
                                        var oBlob = new Blob([sCSVContent], { type: "text/csv;charset=utf-8;" });
                                        var sURL = window.URL.createObjectURL(oBlob);
                                        var oLink = document.createElement("a");
                                        oLink.href = sURL;
                                        oLink.download = "Supplier_Form_Data.csv";
                                        document.body.appendChild(oLink);
                                        oLink.click();
                                        document.body.removeChild(oLink);
                                        
                                        sap.m.MessageToast.show("Form data downloaded as CSV.");
                                    }
                                }).addStyleClass("footer-button")
                            ]
                        }).addStyleClass("objectPageFooter")
                    })
                ]
            }).placeAt("content");
            
            // Initial update of attachment count
            updateAttachmentCount();
        });
    </script>
</body>
</html>
            `;

            var newWindow = window.open("", "_blank");
            if (newWindow) {
                newWindow.document.write(sHtmlContent);
                newWindow.document.close();
                
                // Listen for messages from the popup
                window.addEventListener("message", (event) => {
                    if (event.data.type === "SUPPLIER_FORM_SAVED") {
                        this._handleSavedSupplierForm(event.data.data);
                    }
                });
            } else {
                MessageToast.show("Failed to open new tab. Please allow pop-ups for this site.");
            }
        },

        _handleSavedSupplierForm: function(oFormData) {
            // Update the model with the saved data
            var oNewSupplierModel = this.getView().getModel("newSupplier");
            oNewSupplierModel.setData(oFormData);
            
            MessageToast.show("Supplier form data saved successfully!");
        },

        onDifferentAddressSelect: function (sValue) {
            this.getView().getModel("verification").setProperty("/differentAddress", sValue);
        },

        _updateTileCounts: function (oData) {
            var aItems = oData.items;
            oData.draftCount = aItems.filter(item => item.status === "DRAFT").length;
            oData.myPendingCount = aItems.filter(item => item.stage === "BUYER").length;
            oData.pendingWithSupplierCount = aItems.filter(item => item.stage === "SUPPLIER").length;
            oData.onBoardingCount = aItems.filter(item => item.stage === "ON BOARDING").length;
            oData.allCount = aItems.length;
        },

        _applyFilters: function () {
            var oTable = this.byId("productsTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];

            var sSupplierId = this.byId("supplierIdInput").getValue();
            if (sSupplierId) {
                aFilters.push(new Filter("supplierRequestId", FilterOperator.Contains, sSupplierId));
            }

            var sSupplierType = this.byId("supplierTypeComboBox").getSelectedKey();
            if (sSupplierType && sSupplierType !== "All") {
                aFilters.push(new Filter("type", FilterOperator.EQ, sSupplierType));
            }

            var sStage = this.byId("stageComboBox").getSelectedKey();
            if (sStage && sStage !== "All") {
                aFilters.push(new Filter("stage", FilterOperator.EQ, sStage));
            }

            var sStatus = this.byId("statusComboBox").getSelectedKey();
            if (sStatus && sStatus !== "All") {
                aFilters.push(new Filter("status", FilterOperator.EQ, sStatus));
            }

            oBinding.filter(aFilters.length > 0 ? new Filter({ filters: aFilters, and: true }) : []);
        },

        onSupplierIdChange: function () {
            this._applyFilters();
        },

        onSupplierTypeChange: function () {
            this._applyFilters();
        },

        onStageChange: function () {
            this._applyFilters();
        },

        onStatusChange: function () {
            this._applyFilters();
        },

        _refreshTable: function () {
            var oTable = this.byId("productsTable");
            if (oTable && oTable.getBinding("items")) {
                oTable.getBinding("items").refresh(true);
            }
        },

        _centerTiles: function () {
            var oGrid = this.byId("tileGrid");
            if (oGrid) {
                oGrid.addStyleClass("centeredGrid");
            }
        },

        _parseDate: function (sDate) {
            if (!sDate) return new Date(0);
            var [day, month, year] = sDate.split("-").map(Number);
            return new Date(year, month - 1, day);
        },

        _updateSortIcon: function (sColumnKey, bDescending) {
            var oIcon = this.byId("sortIcon_" + sColumnKey);
            if (oIcon) {
                oIcon.setSrc(bDescending ? "sap-icon://sort-descending" : "sap-icon://sort-ascending");
            }
        },

        _sortColumn: function (sProperty, fnCompare) {
            var oModel = this.getView().getModel("products");
            var oData = oModel.getData();
            var aItems = oData.items;

            if (!aItems || aItems.length === 0) {
                MessageToast.show("No data to sort.");
                return;
            }

            // Reset all sort states except the current one
            Object.keys(this._sortStates).forEach(key => {
                if (key !== sProperty) {
                    this._sortStates[key] = false;
                    this._updateSortIcon(key, false);
                }
            });

            // Toggle the current sort state
            this._sortStates[sProperty] = !this._sortStates[sProperty];
            var bDescending = this._sortStates[sProperty];

            try {
                aItems.sort((a, b) => bDescending ? fnCompare(b[sProperty], a[sProperty]) : fnCompare(a[sProperty], b[sProperty]));
                oModel.setProperty("/items", aItems);
                this._centerTiles();
                this._refreshTable();
                this._updateSortIcon(sProperty, bDescending);
                MessageToast.show(`Sorted ${sProperty} column ${bDescending ? "Descending" : "Ascending"}`);
            } catch (e) {
                MessageToast.show(`Error while sorting ${sProperty}: ${e.message}`);
            }
        },

        onSortSupplierRequestId: function () {
            this._sortColumn("supplierRequestId", (a, b) => {
                var aNum = parseInt(a.replace("R", ""), 10) || 0;
                var bNum = parseInt(b.replace("R", ""), 10) || 0;
                return aNum - bNum;
            });
        },

        onSortSupplierName: function () {
            this._sortColumn("supplierName", (a, b) => (a || "").localeCompare(b || ""));
        },

        onSortType: function () {
            this._sortColumn("type", (a, b) => (a || "").localeCompare(b || ""));
        },

        onSortRequestCreationDate: function () {
            this._sortColumn("requestCreationDate", (a, b) => this._parseDate(a) - this._parseDate(b));
        },

        onSortRequestAging: function () {
            this._sortColumn("requestAging", (a, b) => {
                var aDays = parseInt(a.split(" ")[0], 10) || 0;
                var bDays = parseInt(b.split(" ")[0], 10) || 0;
                return aDays - bDays;
            });
        },

        onSortLastActionDate: function () {
            this._sortColumn("lastActionDate", (a, b) => this._parseDate(a) - this._parseDate(b));
        },

        onSortLastActionAging: function () {
            this._sortColumn("lastActionAging", (a, b) => {
                var aDays = parseInt(a.split(" ")[0], 10) || 0;
                var bDays = parseInt(b.split(" ")[0], 10) || 0;
                return aDays - bDays;
            });
        },

        onSortStage: function () {
            this._sortColumn("stage", (a, b) => (a || "").localeCompare(b || ""));
        },

        onSortStatus: function () {
            this._sortColumn("status", (a, b) => (a || "").localeCompare(b || ""));
        },

        onTilePress: function (oEvent) {
            var sTileId = oEvent.getSource().getId();
            var oTable = this.byId("productsTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];

            if (sTileId.includes("draftTile")) {
                aFilters.push(new Filter("status", FilterOperator.EQ, "DRAFT"));
            } else if (sTileId.includes("myPendingTile")) {
                aFilters.push(new Filter("stage", FilterOperator.EQ, "BUYER"));
            } else if (sTileId.includes("pendingWithSupplierTile")) {
                aFilters.push(new Filter("stage", FilterOperator.EQ, "SUPPLIER"));
            } else if (sTileId.includes("onBoardingTile")) {
                aFilters.push(new Filter("stage", FilterOperator.EQ, "ON BOARDING"));
            } else if (sTileId.includes("allTile")) {
                oBinding.filter([]);
                this.byId("supplierIdInput").setValue("");
                this.byId("supplierTypeComboBox").setSelectedKey("All");
                this.byId("stageComboBox").setSelectedKey("All");
                this.byId("statusComboBox").setSelectedKey("All");
                return;
            }

            oBinding.filter(aFilters);
            this.byId("supplierIdInput").setValue("");
            this.byId("supplierTypeComboBox").setSelectedKey("All");
            this.byId("stageComboBox").setSelectedKey("All");
            this.byId("statusComboBox").setSelectedKey("All");
        },

        onOrderPress: function () {
            var oNewSupplierModel = this.getView().getModel("newSupplier");
            oNewSupplierModel.setData({
                spendType: "",
                supplierType: "",
                gstin: "",
                pan: "",
                address: "",
                isVerified: false,
                currentStep: 1,
                justification: "",
                primaryContactName: "",
                primaryContactNumber: "",
                primaryContactEmail: "",
                isExistingSupplier: false,
                existingSupplierCode: "",
                isDifferentAddress: false,
                differentAddress: "",
                purchasingOrg: "",
                paymentTerms: "",
                vendorCodeCreationType: "",
                buyerRequesting: "",
                isRelatedParty: false,
                businessJustification: "",
                additionalComments: "",
                attachments: [],
                safeNetworks: "",
                serviceSupplierChannel: "",
                broadcastInformationTechnology: "",
                additionsInformation: "",
                supportControl: ""
            });

            var sHtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Supplier Request Form</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            background-color: #f0f0f0; 
            margin: 0; 
            padding: 0; 
        }
        .form-container { 
            padding: 20px; 
            max-width: 800px; 
            margin: 20px auto; 
            border: 1px solid #d9d9d9; 
            border-radius: 8px; 
            background-color: #fff; 
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
        }
        .header { 
            background-color: #ff0000; 
            color: #fff; 
            padding: 10px; 
            text-align: center; 
            border-top-left-radius: 8px; 
            border-top-right-radius: 8px; 
            font-size: 18px; 
            font-weight: bold; 
        }
        .panel { 
            border: 1px solid #d9d9d9; 
            border-radius: 4px; 
            padding: 15px; 
            margin-top: 10px; 
            background-color: #f9f9f9; 
        }
        .step-indicator { 
            display: flex; 
            align-items: center; 
            margin-bottom: 20px; 
            justify-content: center; 
        }
        .step-number { 
            width: 20px; 
            height: 20px; 
            border-radius: 50%; 
            text-align: center; 
            line-height: 20px; 
            font-size: 12px; 
            margin-right: 5px; 
        }
        .step-text { 
            font-size: 12px; 
            line-height: 20px; 
            margin-right: 10px; 
        }
        .step-gap { 
            width: 20px; 
            height: 2px; 
            background-color: #d3d3d3; 
            margin: 0 5px; 
        }
        .inactive-step { 
            background-color: #d3d3d3; 
            color: #666; 
        }
        .active-step { 
            background-color: #ff0000; 
            color: #fff; 
        }
        .active-step.step-text { 
            background-color: transparent; 
            color: #000; 
            font-weight: bold; 
        }
        .form-field { 
            margin-bottom: 15px; 
        }
        .form-field label { 
            display: block; 
            font-weight: bold; 
            margin-bottom: 5px; 
        }
        .form-field input, 
        .form-field textarea, 
        .form-field select { 
            width: 100%; 
            padding: 8px; 
            border: 1px solid #d9d9d9; 
            border-radius: 4px; 
            box-sizing: border-box; 
        }
        .form-field .input-with-button { 
            display: flex; 
            align-items: center; 
            gap: 10px; 
        }
        .form-field button { 
            padding: 8px 16px; 
            background-color: #0070f0; 
            color: #fff; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer; 
        }
        .form-field button:disabled { 
            background-color: #d3d3d3; 
            cursor: not-allowed; 
        }
        .form-field .verified { 
            background-color: #28a745; 
        }
        .buttons { 
            display: flex; 
            justify-content: flex-end; 
            gap: 15px; 
            margin-top: 20px; 
        }
        .buttons button { 
            padding: 8px 16px; 
            border-radius: 4px; 
            cursor: pointer; 
        }
        .buttons .proceed { 
            background-color: #0070f0; 
            color: #fff; 
            border: none; 
        }
        .buttons .cancel { 
            background-color: #fff; 
            color: #ff0000; 
            border: 1px solid #ff0000; 
        }
        .buttons .previous { 
            background-color: #fff; 
            color: #000; 
            border: 1px solid #d9d9d9; 
        }
        .error { 
            border-color: #ff0000 !important; 
        }
        .error-message { 
            color: #ff0000; 
            font-size: 12px; 
            margin-top: 5px; 
        }
        .duplicate-warning { 
            color: #ff0000; 
            margin-bottom: 15px; 
            display: flex; 
            align-items: center; 
        }
        .duplicate-warning::before { 
            content: "⚠️"; 
            margin-right: 5px; 
        }
        .duplicate-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 15px; 
        }
        .duplicate-table th, 
        .duplicate-table td { 
            border: 1px solid #d9d9d9; 
            padding: 8px; 
            text-align: left; 
        }
        .duplicate-table th { 
            background-color: #f7f7f7; 
        }
        .duplicate-table input[type="radio"] { 
            margin-right: 5px; 
        }
        .reason-field { 
            margin-top: 10px; 
        }
        .field-container { 
            display: flex; 
            align-items: center; 
            margin-bottom: 10px; 
        }
        .field-container label { 
            margin-bottom: 0; 
        }
        .radio-group { 
            display: inline-flex; 
            align-items: center; 
            gap: 10px; 
        }
        .radio-group input[type="radio"] { 
            margin: 0 5px 0 0; 
        }
        .radio-group label { 
            font-weight: normal; 
            margin: 0; 
        }
    </style>
</head>
<body>
    <div class="form-container">
        <div class="header">NEW SUPPLIER REQUEST FORM</div>
        <div class="panel">
            <div id="stepIndicator" class="step-indicator">
                <div id="step1Number" class="step-number active-step">1</div>
                <div id="step1Text" class="step-text active-step">SUPPLIER SPEND TYPE</div>
                <div class="step-gap"></div>
                <div id="step2Number" class="step-number inactive-step">2</div>
                <div id="step2Text" class="step-text inactive-step">SUPPLIER TYPE</div>
                <div class="step-gap"></div>
                <div id="step3Number" class="step-number inactive-step">3</div>
                <div id="step3Text" class="step-text inactive-step">GST & PAN VERIFICATION</div>
            </div>
            <div id="formContent">
                <div id="step1" class="step-content">
                    <div class="form-field">
                        <label for="spendType">SUPPLIER SPEND TYPE: <span style="color: #ff0000;">*</span></label>
                        <select id="spendType">
                            <option value="">Select Spend Type</option>
                            <option value="Direct">Direct</option>
                            <option value="Indirect">Indirect</option>
                            <option value="Capital">Capital</option>
                            <option value="Value Fit">Value Fit</option>
                            <option value="Proto">Proto</option>
                            <option value="Accessories">Accessories</option>
                        </select>
                        <div id="spendTypeError" class="error-message" style="display: none;">Please select a spend type.</div>
                    </div>
                </div>
                <div id="step2" class="step-content" style="display: none;">
                    <div class="form-field">
                        <label for="supplierType">SUPPLIER TYPE: <span style="color: #ff0000;">*</span></label>
                        <select id="supplierType">
                            <option value="">Select Supplier Type</option>
                            <option value="LOCAL GST">LOCAL GST</option>
                            <option value="LOCAL NON-GST">LOCAL NON-GST</option>
                            <option value="IMPORT">IMPORT</option>
                        </select>
                        <div id="supplierTypeError" class="error-message" style="display: none;">Please select a supplier type.</div>
                    </div>
                </div>
                <div id="step3" class="step-content" style="display: none;">
                    <div id="duplicateWarning" class="duplicate-warning" style="display: none;">Duplicate Found: Vendor already exists with same GSTIN/PAN</div>
                    <table id="duplicateTable" class="duplicate-table" style="display: none;">
                        <thead><tr><th></th><th>Vendor Code</th><th>Spend Type</th><th>Postal Code</th></tr></thead>
                        <tbody>
                            <tr><td><input type="radio" name="duplicateVendor" value="V0001" onclick="updateProceedButton()"></td><td>V0001</td><td>Direct</td><td>122001</td></tr>
                            <tr><td><input type="radio" name="duplicateVendor" value="V0002" onclick="updateProceedButton()"></td><td>V0002</td><td>Direct</td><td>122001</td></tr>
                            <tr><td><input type="radio" name="duplicateVendor" value="V0003" onclick="updateProceedButton()"></td><td>V0003</td><td>Direct</td><td>122001</td></tr>
                        </tbody>
                    </table>
                    <div id="reasonField" class="reason-field" style="display: none;">
                        <div class="form-field">
                            <label for="duplicateReason">PROVIDE REASON for creating Duplicate Vendor Code:</label>
                            <input type="text" id="duplicateReason" placeholder="Enter reason" oninput="updateProceedButton()">
                            <div id="duplicateReasonError" class="error-message" style="display: none;">Please provide a reason.</div>
                        </div>
                        <div class="form-field">
                            <div class="field-container">
                                <label>DIFFERENT ADDRESS</label>
                                <div class="radio-group">
                                    <input type="radio" name="differentAddress" value="Yes" id="differentAddressYes" onclick="updateProceedButton()">
                                    <label for="differentAddressYes">Yes</label>
                                    <input type="radio" name="differentAddress" value="No" id="differentAddressNo" onclick="updateProceedButton()">
                                    <label for="differentAddressNo">No</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-field">
                        <label for="gstin">GSTIN No.: <span style="color: #ff0000;">*</span></label>
                        <div class="input-with-button">
                            <input type="text" id="gstin" placeholder="Enter GSTIN No.">
                            <button id="gstinVerifyButton" onclick="verifyGSTIN()">Verify</button>
                        </div>
                        <div id="gstinError" class="error-message" style="display: none;"></div>
                    </div>
                    <div class="form-field">
                        <label for="pan">PAN Card No.: <span style="color: #ff0000;">*</span></label>
                        <div class="input-with-button">
                            <input type="text" id="pan" placeholder="Enter PAN Card No.">
                            <button id="panVerifyButton" onclick="verifyPAN()">Verify</button>
                        </div>
                        <div id="panError" class="error-message" style="display: none;"></div>
                    </div>
                    <div class="form-field">
                        <label for="address">Address</label>
                        <textarea id="address" placeholder="Enter Address" rows="3"></textarea>
                    </div>
                </div>
            </div>
            <div class="buttons">
                <button id="previousButton" class="previous" onclick="previousStep()" style="display: none;">Previous Step</button>
                <button id="nextButton" class="proceed" onclick="nextStep()">Next Step</button>
                <button id="proceedButton" class="proceed" onclick="proceed()" style="display: none;" disabled>Proceed</button>
                <button class="cancel" onclick="cancel()">Cancel</button>
            </div>
        </div>
    </div>
    <script>
        let currentStep = 1;
        let isGstinVerified = false;
        let isPanVerified = false;
        let formData = {
            spendType: "",
            supplierType: "",
            gstin: "",
            pan: "",
            address: "",
            isVerified: false,
            duplicateVendor: "",
            duplicateReason: "",
            differentAddress: "",
            primaryContactName: "",
            primaryContactNumber: "",
            primaryContactEmail: "",
            isExistingSupplier: false,
            existingSupplierCode: "",
            isDifferentAddress: false,
            purchasingOrg: "",
            paymentTerms: "",
            vendorCodeCreationType: "",
            buyerRequesting: "",
            isRelatedParty: false,
            businessJustification: "",
            additionalComments: "",
            attachments: [],
            safeNetworks: "",
            serviceSupplierChannel: "",
            broadcastInformationTechnology: "",
            additionsInformation: "",
            supportControl: ""
        };

        function updateStepIndicator() {
            document.getElementById("step1Number").className = "step-number " + (currentStep === 1 ? "active-step" : "inactive-step");
            document.getElementById("step1Text").className = "step-text " + (currentStep === 1 ? "active-step" : "inactive-step");
            document.getElementById("step2Number").className = "step-number " + (currentStep === 2 ? "active-step" : "inactive-step");
            document.getElementById("step2Text").className = "step-text " + (currentStep === 2 ? "active-step" : "inactive-step");
            document.getElementById("step3Number").className = "step-number " + (currentStep === 3 ? "active-step" : "inactive-step");
            document.getElementById("step3Text").className = "step-text " + (currentStep === 3 ? "active-step" : "inactive-step");

            document.getElementById("step1").style.display = currentStep === 1 ? "block" : "none";
            document.getElementById("step2").style.display = currentStep === 2 ? "block" : "none";
            document.getElementById("step3").style.display = currentStep === 3 ? "block" : "none";

            document.getElementById("previousButton").style.display = currentStep === 1 ? "none" : "inline-block";
            document.getElementById("nextButton").style.display = currentStep < 3 ? "inline-block" : "none";
            document.getElementById("proceedButton").style.display = currentStep === 3 ? "inline-block" : "none";
        }

        function nextStep() {
            if (currentStep === 1) {
                formData.spendType = document.getElementById("spendType").value;
                if (!formData.spendType) {
                    document.getElementById("spendType").classList.add("error");
                    document.getElementById("spendTypeError").style.display = "block";
                    return;
                }
                document.getElementById("spendType").classList.remove("error");
                document.getElementById("spendTypeError").style.display = "none";
                currentStep++;
            } else if (currentStep === 2) {
                formData.supplierType = document.getElementById("supplierType").value;
                if (!formData.supplierType) {
                    document.getElementById("supplierType").classList.add("error");
                    document.getElementById("supplierTypeError").style.display = "block";
                    return;
                }
                document.getElementById("supplierType").classList.remove("error");
                document.getElementById("supplierTypeError").style.display = "none";
                currentStep++;
                checkForDuplicates();
            }
            updateStepIndicator();
        }

        function previousStep() {
            if (currentStep > 1) {
                currentStep--;
                document.getElementById("duplicateWarning").style.display = "none";
                document.getElementById("duplicateTable").style.display = "none";
                document.getElementById("reasonField").style.display = "none";
                updateStepIndicator();
            }
        }

        function verifyGSTIN() {
            formData.gstin = document.getElementById("gstin").value.trim();

            const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!formData.gstin) {
                document.getElementById("gstin").classList.add("error");
                document.getElementById("gstinError").textContent = "GSTIN No. is required.";
                document.getElementById("gstinError").style.display = "block";
                return;
            } else if (!gstinRegex.test(formData.gstin)) {
                document.getElementById("gstin").classList.add("error");
                document.getElementById("gstinError").textContent = "Invalid GSTIN format (e.g., 27AABCU9603R1ZM).";
                document.getElementById("gstinError").style.display = "block";
                return;
            } else {
                document.getElementById("gstin").classList.remove("error");
                document.getElementById("gstinError").style.display = "none";
            }

            const validGSTINs = ["27AABCU9603R1ZM", "29AAGCM1234P1ZT", "33AAHCP7890N1ZF"];
            if (validGSTINs.includes(formData.gstin)) {
                document.getElementById("gstinVerifyButton").textContent = "Verified";
                document.getElementById("gstinVerifyButton").classList.add("verified");
                document.getElementById("gstinVerifyButton").disabled = true;
                isGstinVerified = true;
                checkForDuplicates();
                alert("GSTIN verified successfully!");
            } else {
                document.getElementById("gstinVerifyButton").textContent = "Verify";
                document.getElementById("gstinVerifyButton").classList.remove("verified");
                document.getElementById("gstinVerifyButton").disabled = false;
                isGstinVerified = false;
                alert("GSTIN verification failed. Please check the GSTIN.");
            }
        }

        function verifyPAN() {
            formData.pan = document.getElementById("pan").value.trim();

            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (!formData.pan) {
                document.getElementById("pan").classList.add("error");
                document.getElementById("panError").textContent = "PAN Card No. is required.";
                document.getElementById("panError").style.display = "block";
                return;
            } else if (!panRegex.test(formData.pan)) {
                document.getElementById("pan").classList.add("error");
                document.getElementById("panError").textContent = "Invalid PAN format (e.g., AABCU9603R).";
                document.getElementById("panError").style.display = "block";
                return;
            } else {
                document.getElementById("pan").classList.remove("error");
                document.getElementById("panError").style.display = "none";
            }

            const validPANs = ["AABCU9603R", "AAGCM1234P", "AAHCP7890N"];
            if (validPANs.includes(formData.pan)) {
                document.getElementById("panVerifyButton").textContent = "Verified";
                document.getElementById("panVerifyButton").classList.add("verified");
                document.getElementById("panVerifyButton").disabled = true;
                isPanVerified = true;
                checkForDuplicates();
                alert("PAN verified successfully!");
            } else {
                document.getElementById("panVerifyButton").textContent = "Verify";
                document.getElementById("panVerifyButton").classList.remove("verified");
                document.getElementById("panVerifyButton").disabled = false;
                isPanVerified = false;
                alert("PAN verification failed. Please check the PAN.");
            }
        }

        function checkForDuplicates() {
            const duplicateGSTINs = ["27AABCU9603R1ZM"];
            const duplicatePANs = ["AABCU9603R"];
            const isDuplicate = (formData.gstin && duplicateGSTINs.includes(formData.gstin)) || (formData.pan && duplicatePANs.includes(formData.pan));

            if (isDuplicate && isGstinVerified && isPanVerified) {
                document.getElementById("duplicateWarning").style.display = "flex";
                document.getElementById("duplicateTable").style.display = "table";
                document.getElementById("reasonField").style.display = "block";
            } else {
                document.getElementById("duplicateWarning").style.display = "none";
                document.getElementById("duplicateTable").style.display = "none";
                document.getElementById("reasonField").style.display = "none";
                if (isGstinVerified && isPanVerified) {
                    document.getElementById("proceedButton").disabled = false;
                }
            }
        }

        function updateProceedButton() {
            const selectedVendor = document.querySelector("input[name='duplicateVendor']:checked");
            const reason = document.getElementById("duplicateReason").value.trim();
            const differentAddress = document.querySelector("input[name='differentAddress']:checked");

            formData.duplicateVendor = selectedVendor ? selectedVendor.value : "";
            formData.duplicateReason = reason;
            formData.differentAddress = differentAddress ? differentAddress.value : "";

            if (formData.duplicateVendor && reason && differentAddress) {
                document.getElementById("proceedButton").disabled = false;
                document.getElementById("duplicateReasonError").style.display = "none";
            } else {
                document.getElementById("proceedButton").disabled = true;
                if (!reason) {
                    document.getElementById("duplicateReasonError").style.display = "block";
                } else {
                    document.getElementById("duplicateReasonError").style.display = "none";
                }
            }
        }

        function proceed() {
            if (!isGstinVerified || !isPanVerified) {
                alert("Please verify both GSTIN and PAN before proceeding.");
                return;
            }

            const duplicateWarningVisible = document.getElementById("duplicateWarning").style.display === "flex";
            if (duplicateWarningVisible && (!formData.duplicateVendor || !formData.duplicateReason || !formData.differentAddress)) {
                alert("Please complete the duplicate vendor details before proceeding.");
                return;
            }

            formData.address = document.getElementById("address").value.trim();
            formData.isVerified = true;

            if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ type: "NEW_SUPPLIER", data: formData }, "*");
            }
            alert("New Supplier Request created successfully!");
            window.close();
        }

        function cancel() {
            if (confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
                window.close();
            }
        }

        updateStepIndicator();
    </script>
</body>
</html>
            `;

            var newWindow = window.open("", "_blank");
            if (newWindow) {
                newWindow.document.write(sHtmlContent);
                newWindow.document.close();
                window.addEventListener("message", (event) => {
                    if (event.data.type === "NEW_SUPPLIER") {
                        this._handleNewSupplier(event.data.data);
                    }
                }, { once: true });
            } else {
                MessageToast.show("Failed to open new tab. Please allow pop-ups for this site.");
            }
        },

        _handleNewSupplier: function (formData) {
            var oModel = this.getView().getModel("products");
            var oData = oModel.getData();
            var aItems = oData.items;

            var iLastId = Math.max(...aItems.map(item => parseInt(item.supplierRequestId.replace("R", ""), 10)));
            var sNewId = "R" + (iLastId + 1).toString().padStart(2, "0");

            var oDate = new Date();
            var sCurrentDate = `${oDate.getDate().toString().padStart(2, "0")}-${(oDate.getMonth() + 1).toString().padStart(2, "0")}-${oDate.getFullYear()}`;

            var oNewSupplier = {
                supplierRequestId: sNewId,
                supplierName: "New Supplier " + sNewId,
                type: formData.spendType,
                requestCreationDate: sCurrentDate,
                requestAging: "0 Days",
                lastActionDate: sCurrentDate,
                lastActionAging: "0 Days",
                stage: "SUPPLIER",
                status: "DRAFT"
            };

            aItems.unshift(oNewSupplier);
            this._updateTileCounts(oData);
            oModel.setData(oData);
            this._originalItems = JSON.parse(JSON.stringify(oData.items));
            this._refreshTable();

            MessageToast.show(`New Supplier Request created successfully! ID: ${sNewId}`);
            this.openDetailedSupplierForm(formData);
        },

        onDownloadPress: function () {
            var oModel = this.getView().getModel("products");
            var aItems = oModel.getProperty("/items");

            if (!aItems || aItems.length === 0) {
                MessageToast.show("No data to download.");
                return;
            }

            var aHeaders = ["Supplier Request ID", "Supplier Name", "Type", "Request Creation Date", "Request Aging", "Last Action Date", "Last Action Aging", "Stage", "Status"];
            var aRows = aItems.map(oItem => [
                oItem.supplierRequestId,
                oItem.supplierName,
                oItem.type,
                oItem.requestCreationDate,
                oItem.requestAging,
                oItem.lastActionDate,
                oItem.lastActionAging,
                oItem.stage,
                oItem.status
            ].map(sValue => `"${(sValue || "").replace(/"/g, '""')}"`).join(","));

            var sCSVContent = aHeaders.join(",") + "\n" + aRows.join("\n");
            var oBlob = new Blob([sCSVContent], { type: "text/csv;charset=utf-8;" });
            var sURL = window.URL.createObjectURL(oBlob);

            var oLink = document.createElement("a");
            oLink.href = sURL;
            oLink.download = "Supplier_Registration_Data.csv";
            document.body.appendChild(oLink);
            oLink.click();
            document.body.removeChild(oLink);

            MessageToast.show("Table data downloaded as CSV.");
        },

        onResetSort: function () {
            Object.keys(this._sortStates).forEach(sKey => {
                this._sortStates[sKey] = false;
                this._updateSortIcon(sKey, false);
            });

            var oModel = this.getView().getModel("products");
            oModel.setProperty("/items", JSON.parse(JSON.stringify(this._originalItems)));
            this._centerTiles();
            this._refreshTable();

            MessageToast.show("Sort state reset to original.");
        }
    });
});
