sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"
], function (Controller, JSONModel, MessageBox, MessageToast, Filter, FilterOperator, Sorter) {
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
                safeNetworks: "ABC Industries Private Limited",
                serviceSupplierChannel: "ABC Industries Private Limited",
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
                /* Combined CSS for all components */
                .form-container { 
                    padding: 20px; 
                    max-width: 800px; 
                    margin: 20px auto; 
                    border: 1px solid #d9d9d9; 
                    border-radius: 8px; 
                    background-color: #fff; 
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
                }
                
                /* Object Page Header styling */
                .customHeader .sapUxAPObjectPageHeaderTitle {
                    background-color: #ff0000 !important;
                    color: #fff !important;
                    text-align: center !important;
                    font-size: 18px !important;
                    font-weight: bold !important;
                    padding: 10px !important;
                }
                
                /* Object Page Section styling */
                .sapUxAPObjectPageSection {
                    margin-bottom: 20px;
                    border: 1px solid #d9d9d9;
                    border-radius: 8px;
                    background-color: #f9f9f9;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                    padding: 15px;
                }
                
                .sapUxAPObjectPageSectionHeader {
                    color: #ff0000 !important; /* Red color for section titles */
                    font-weight: bold !important;
                    font-size: 16px !important;
                    padding: 10px 15px !important;
                    border-bottom: 1px solid #d9d9d9 !important;
                    border-top-left-radius: 8px !important;
                    border-top-right-radius: 8px !important;
                    background-color: #f0f0f0 !important;
                }
                
                /* Networked sections styling as in Capture 19.1 */
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
                
                /* Form styling for Primary Supplier Contact and Purchasing Data */
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
            var sGstin = typeof formData === "object" ? formData.gstin : formData;
            var sPan = typeof formData === "object" ? formData.pan : formData;
            var sSpendType = formData.spendType || "Direct";
            var sSupplierType = formData.supplierType || "LOCAL GST";
            var sJustification = formData.justification || "";
            var sAddress = formData.address || "Plot No. 12, Industrial Area, Sector 34, Gurgaon, Haryana, 122001, India";
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
            var sSafeNetworks = formData.safeNetworks || "ABC Industries Private Limited";
            var sServiceSupplierChannel = formData.serviceSupplierChannel || "ABC Industries Private Limited";
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
        
        /* Style for ObjectPageSection title to match captures */
        .sapUxAPObjectPageSectionHeader .sapUxAPObjectPageSectionTitle {
            color: #ff0000 !important; /* Red color for section titles */
            font-weight: bold !important;
            font-size: 16px !important;
        }
        
        /* Networked sections styling as in Capture 19.1 */
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
        
        /* Form styling for Primary Supplier Contact and Purchasing Data */
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
                            
                            // General Supplier Information section (as in Capture 19.1)
                            new sap.uxap.ObjectPageSection({
                                title: "General Supplier Information",
                                titleUppercase: false,
                                subSections: [
                                    new sap.uxap.ObjectPageSubSection({
                                        blocks: [
                                            new sap.ui.core.HTML({
                                                content: \`
                                                    <div class="networked-section">
                                                        <div class="networked-section-header">SUPPLIER FULL LEGAL NAME</div>
                                                        <div class="networked-item">
                                                            <div class="networked-label">Supplier Full Legal Name:</div>
                                                            <div class="networked-value">${sSafeNetworks}</div>
                                                        </div>
                                                    </div>
                                                    <div class="networked-section">
                                                        <div class="networked-section-header">SUPPLIER TRADE NAME (GST)</div>
                                                        <div class="networked-item">
                                                            <div class="networked-label">Supplier Trade Name (GST):</div>
                                                            <div class="networked-value">${sServiceSupplierChannel}</div>
                                                        </div>
                                                    </div>
                                                    <div class="networked-section">
                                                        <div class="networked-section-header">SUPPLIER ADDRESS</div>
                                                        <div class="networked-item">
                                                            <div class="networked-label">Supplier Address:</div>
                                                            <div class="networked-value">${sAddress}</div>
                                                        </div>
                                                    </div>
                                                    <div class="networked-section">
                                                        <div class="networked-section-header">SUPPLIER ADDRESS (GST)</div>
                                                        <div class="networked-item">
                                                            <div class="networked-label">Supplier Address (GST):</div>
                                                            <div class="networked-value">${sAddress}</div>
                                                        </div>
                                                    </div>
                                                \`
                                            })
                                        ]
                                    })
                                ]
                            }),
                            
                            // Primary Supplier Contact section (as in Capture 19.2)
                            new sap.uxap.ObjectPageSection({
                                title: "Primary Supplier Contact",
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
                                                    new sap.m.Label({ text: "Primary Contact First Name:", design: "Bold", required: true }),
                                                    new sap.m.Input({
                                                        value: "${sPrimaryContactName}",
                                                        placeholder: "Enter First Name"
                                                    }),
                                                    new sap.m.Label({ text: "Primary Contact Last Name:", design: "Bold", required: true }),
                                                    new sap.m.Input({
                                                        placeholder: "Enter Last Name"
                                                    }),
                                                    new sap.m.Label({ text: "Primary Contact Email:", design: "Bold", required: true }),
                                                    new sap.m.Input({
                                                        value: "${sPrimaryContactEmail}",
                                                        placeholder: "Enter Email"
                                                    }),
                                                    new sap.m.Label({ text: "Primary Contact Mobile Number:", design: "Bold", required: true }),
                                                    new sap.m.Input({
                                                        value: "${sPrimaryContactNumber}",
                                                        placeholder: "Enter Mobile Number"
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }),
                            
                            // Purchasing Data section (as in Capture 19.3)
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
                                                    new sap.m.Label({ text: "Company Code:", design: "Bold" }),
                                                    new sap.m.Select({
                                                        width: "100%",
                                                        items: [
                                                            new sap.ui.core.Item({ key: "", text: "Select" }),
                                                            new sap.ui.core.Item({ key: "C001", text: "C001" }),
                                                            new sap.ui.core.Item({ key: "C002", text: "C002" })
                                                        ]
                                                    }),
                                                    new sap.m.Label({ text: "Select Group Supplier:", design: "Bold" }),
                                                    new sap.m.Select({
                                                        width: "100%",
                                                        items: [
                                                            new sap.ui.core.Item({ key: "", text: "Select" }),
                                                            new sap.ui.core.Item({ key: "GS001", text: "GS001" }),
                                                            new sap.ui.core.Item({ key: "GS002", text: "GS002" })
                                                        ]
                                                    }),
                                                    new sap.m.Label({ text: "Is Group not available?:", design: "Bold" }),
                                                    new sap.m.RadioButtonGroup({
                                                        columns: 2,
                                                        buttons: [
                                                            new sap.m.RadioButton({ text: "Yes", selected: ${bIsExistingSupplier} }),
                                                            new sap.m.RadioButton({ text: "No", selected: ${!bIsExistingSupplier} })
                                                        ]
                                                    }),
                                                    new sap.m.Label({ text: "Select Parent Supplier:", design: "Bold" }),
                                                    new sap.m.Select({
                                                        width: "100%",
                                                        items: [
                                                            new sap.ui.core.Item({ key: "", text: "Select" }),
                                                            new sap.ui.core.Item({ key: "PS001", text: "PS001" }),
                                                            new sap.ui.core.Item({ key: "PS002", text: "PS002" })
                                                        ]
                                                    }),
                                                    new sap.m.Label({ text: "Is Parent not available?:", design: "Bold" }),
                                                    new sap.m.RadioButtonGroup({
                                                        columns: 2,
                                                        buttons: [
                                                            new sap.m.RadioButton({ text: "Yes", selected: ${bIsDifferentAddress} }),
                                                            new sap.m.RadioButton({ text: "No", selected: ${!bIsDifferentAddress} })
                                                        ]
                                                    }),
                                                    new sap.m.Label({ text: "Enter new Parent to be created:", design: "Bold" }),
                                                    new sap.m.Input({
                                                        placeholder: "Enter new Parent"
                                                    }),
                                                    new sap.m.Label({ text: "Account Group:", design: "Bold" }),
                                                    new sap.m.Select({
                                                        width: "100%",
                                                        items: [
                                                            new sap.ui.core.Item({ key: "", text: "Select" }),
                                                            new sap.ui.core.Item({ key: "AG001", text: "AG001" }),
                                                            new sap.ui.core.Item({ key: "AG002", text: "AG002" })
                                                        ]
                                                    }),
                                                    new sap.m.Label({ text: "Supplier Assessment:", design: "Bold" }),
                                                    new sap.m.RadioButtonGroup({
                                                        columns: 2,
                                                        buttons: [
                                                            new sap.m.RadioButton({ text: "Yes", selected: false }),
                                                            new sap.m.RadioButton({ text: "No", selected: true })
                                                        ]
                                                    }),
                                                    new sap.m.Label({ text: "Supplier Assessment Form:", design: "Bold" }),
                                                    new sap.m.UploadCollection({
                                                        multiple: true,
                                                        uploadEnabled: true,
                                                        items: {
                                                            path: "/attachments",
                                                            template: new sap.m.UploadCollectionItem({
                                                                fileName: "{fileName}"
                                                            })
                                                        }
                                                    }),
                                                    new sap.m.Label({ text: "Vendor Evaluation Form to be attached:", design: "Bold" }),
                                                    new sap.m.UploadCollection({
                                                        multiple: true,
                                                        uploadEnabled: true,
                                                        items: {
                                                            path: "/attachments",
                                                            template: new sap.m.UploadCollectionItem({
                                                                fileName: "{fileName}"
                                                            })
                                                        }
                                                    }),
                                                    new sap.m.Label({ text: "Supplier Due Diligence check (e.g. Financial Check, 3rd Party Ratings, Legal Check, Etc):", design: "Bold" }),
                                                    new sap.m.RadioButtonGroup({
                                                        columns: 2,
                                                        buttons: [
                                                            new sap.m.RadioButton({ text: "Done", selected: false }),
                                                            new sap.m.RadioButton({ text: "Not Done", selected: true })
                                                        ]
                                                    }),
                                                    new sap.m.Label({ text: "Supporting Documents for Due Diligence:", design: "Bold" }),
                                                    new sap.m.UploadCollection({
                                                        multiple: true,
                                                        uploadEnabled: true,
                                                        items: {
                                                            path: "/attachments",
                                                            template: new sap.m.UploadCollectionItem({
                                                                fileName: "{fileName}"
                                                            })
                                                        }
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }),
                            
                            // Additional Information section
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
                                                    new sap.m.TextArea({
                                                        value: "${sBusinessJustification}",
                                                        rows: 3,
                                                        width: "100%"
                                                    }),
                                                    new sap.m.Label({ text: "Additional Comments:", design: "Bold" }),
                                                    new sap.m.TextArea({
                                                        value: "${sAdditionalComments}",
                                                        rows: 3,
                                                        width: "100%"
                                                    }),
                                                    new sap.m.Label({ text: "Attachments:", design: "Bold" }),
                                                    new sap.m.Text({ id: "attachmentCount", text: "(${aAttachments.length})" }).addStyleClass("attachment-count")
                                                ]
                                            }),
                                            oUploadCollection
                                        ]
                                    })
                                ]
                            }),
                            
                            // Purchasing Organization Information section
                            new sap.uxap.ObjectPageSection({
                                title: "Purchasing Organization Information",
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
                                                    new sap.m.Label({ text: "Purchasing Org:", design: "Bold" }),
                                                    new sap.m.Select({
                                                        width: "100%",
                                                        items: [
                                                            new sap.ui.core.Item({ key: "", text: "Select" }),
                                                            new sap.ui.core.Item({ key: "PO001", text: "PO001" }),
                                                            new sap.ui.core.Item({ key: "PO002", text: "PO002" })
                                                        ]
                                                    }),
                                                    new sap.m.Label({ text: "Purchase Order Currency Code:", design: "Bold" }),
                                                    new sap.m.Select({
                                                        width: "100%",
                                                        items: [
                                                            new sap.ui.core.Item({ key: "", text: "Select" }),
                                                            new sap.ui.core.Item({ key: "INR", text: "INR" }),
                                                            new sap.ui.core.Item({ key: "USD", text: "USD" })
                                                        ]
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }),
                            
                            // Additional Information section (for vendor code)
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
                                                    new sap.m.Label({ text: "Is the vendor code registered with another address?:", design: "Bold" }),
                                                    new sap.m.RadioButtonGroup({
                                                        columns: 2,
                                                        buttons: [
                                                            new sap.m.RadioButton({ text: "Yes", selected: ${bIsDifferentAddress} }),
                                                            new sap.m.RadioButton({ text: "No", selected: ${!bIsDifferentAddress} })
                                                        ]
                                                    }),
                                                    new sap.m.Label({ text: "Enter the corresponding vendor code:", design: "Bold" }),
                                                    new sap.m.Input({
                                                        value: "${sExistingSupplierCode}",
                                                        placeholder: "Enter Vendor Code"
                                                    }),
                                                    new sap.m.Label({ text: "Schema Group for Domestic Supplier:", design: "Bold" }),
                                                    new sap.m.Select({
                                                        width: "100%",
                                                        items: [
                                                            new sap.ui.core.Item({ key: "", text: "Select" }),
                                                            new sap.ui.core.Item({ key: "SG001", text: "SG001" }),
                                                            new sap.ui.core.Item({ key: "SG002", text: "SG002" })
                                                        ]
                                                    }),
                                                    new sap.m.Label({ text: "Purchasing Block Indicator:", design: "Bold" }),
                                                    new sap.m.RadioButtonGroup({
                                                        columns: 2,
                                                        buttons: [
                                                            new sap.m.RadioButton({ text: "Yes", selected: false }),
                                                            new sap.m.RadioButton({ text: "No", selected: true })
                                                        ]
                                                    }),
                                                    new sap.m.Label({ text: "Additional Info if any:", design: "Bold" }),
                                                    new sap.m.UploadCollection({
                                                        multiple: true,
                                                        uploadEnabled: true,
                                                        items: {
                                                            path: "/attachments",
                                                            template: new sap.m.UploadCollectionItem({
                                                                fileName: "{fileName}"
                                                            })
                                                        }
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }),
                            
                            // Payment Terms section
                            new sap.uxap.ObjectPageSection({
                                title: "Payment Terms",
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
                                                    new sap.m.Label({ text: "Payment Terms:", design: "Bold" }),
                                                    new sap.m.Select({
                                                        width: "100%",
                                                        items: [
                                                            new sap.ui.core.Item({ key: "", text: "Select" }),
                                                            new sap.ui.core.Item({ key: "PT001", text: "PT001" }),
                                                            new sap.ui.core.Item({ key: "PT002", text: "PT002" })
                                                        ]
                                                    }),
                                                    new sap.m.Label({ text: "IncoTerms Code:", design: "Bold" }),
                                                    new sap.m.Select({
                                                        width: "100%",
                                                        items: [
                                                            new sap.ui.core.Item({ key: "", text: "Select" }),
                                                            new sap.ui.core.Item({ key: "IC001", text: "IC001" }),
                                                            new sap.ui.core.Item({ key: "IC002", text: "IC002" })
                                                        ]
                                                    }),
                                                    new sap.m.Label({ text: "IncoTerms Location:", design: "Bold" }),
                                                    new sap.m.Select({
                                                        width: "100%",
                                                        items: [
                                                            new sap.ui.core.Item({ key: "", text: "Select" }),
                                                            new sap.ui.core.Item({ key: "IL001", text: "IL001" }),
                                                            new sap.ui.core.Item({ key: "IL002", text: "IL002" })
                                                        ]
                                                    })
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
                                        
                                        // Update form data
                                        oFormData.primaryContactName = sap.ui.getCore().byId("primaryContactFirstName").getValue();
                                        oFormData.primaryContactEmail = sap.ui.getCore().byId("primaryContactEmail").getValue();
                                        oFormData.primaryContactNumber = sap.ui.getCore().byId("primaryContactMobile").getValue();
                                        oFormData.businessJustification = sap.ui.getCore().byId("businessJustification").getValue();
                                        oFormData.additionalComments = sap.ui.getCore().byId("additionalComments").getValue();
                                        
                                        // Get attachments
                                        var aAttachments = [];
                                        oUploadCollection.getItems().forEach(function(oItem) {
                                            aAttachments.push({
                                                fileName: oItem.getFileName()
                                            });
                                        });
                                        oFormData.attachments = aAttachments;
                                        
                                        oModel.setProperty("/formData", oFormData);
                                        
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
                                    text: "Submit",
                                    type: "Emphasized",
                                    press: function () {
                                        sap.m.MessageToast.show("Supplier Request Form submitted successfully!");
                                        window.close();
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
                safeNetworks: "ABC Industries Private Limited",
                serviceSupplierChannel: "ABC Industries Private Limited",
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
            safeNetworks: "ABC Industries Private Limited",
            serviceSupplierChannel: "ABC Industries Private Limited",
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
