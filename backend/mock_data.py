"""
Seed data representing synthetic I4C/Cyber-Cell/RBI complaints.
Includes Digital Arrest, KYC Expiry, Electricity Bill, and Part-Time Job scams.
Shared phone numbers and UPI IDs link across Delhi, West Bengal, Kerala, and Maharashtra.
"""

SEED_COMPLAINTS = [
    # --- CLUSTER 1: Digital Arrest Syndicate (Cross-State: Delhi, West Bengal, Kerala) ---
    {
        "id": "CMP-2026-8801",
        "victim_name": "Ramesh Kumar (68 yrs)",
        "victim_location": "Dwarka, New Delhi",
        "state": "Delhi",
        "scam_type": "Digital Arrest",
        "raw_text": "Received video call from caller pretending to be Mumbai Police Inspector Patil. Said package sent from Mumbai to Taiwan contained 5 fake passports and 150g MDMA. Placed me under 6-hour Digital Arrest on Skype. Forced transfer of Rs. 4,50,000 to safe verification account SBI-998822 (UPI: cbi.verify@okicici). Caller number: +91-9876543210.",
        "phone_numbers": ["+91-9876543210", "+91-9988112233"],
        "upi_ids": ["cbi.verify@okicici", "gov.rbi.clearance@ybl"],
        "bank_names": ["SBI", "ICICI"],
        "urls": ["http://mumbai-police-verify.cc"],
        "amount_lost": 450000,
        "timestamp": "2026-07-20T14:30:00",
        "risk_level": "CRITICAL"
    },
    {
        "id": "CMP-2026-8802",
        "victim_name": "Sunita Banerjee (62 yrs)",
        "victim_location": "Salt Lake, Kolkata",
        "state": "West Bengal",
        "scam_type": "Digital Arrest",
        "raw_text": "Scammer impersonated CBI Officer Sharma over WhatsApp call. Threatening arrest for money laundering linked to my Aadhaar. Kept on camera for 4 hours. Transferred Rs. 2,80,000 to UPI cbi.verify@okicici and account HDFC-441100. Contact number: +91-9876543210.",
        "phone_numbers": ["+91-9876543210"],
        "upi_ids": ["cbi.verify@okicici", "cyber.sec@paytm"],
        "bank_names": ["HDFC"],
        "urls": ["http://cbi-digital-arrest-clearance.net"],
        "amount_lost": 280000,
        "timestamp": "2026-07-21T09:15:00",
        "risk_level": "CRITICAL"
    },
    {
        "id": "CMP-2026-8803",
        "victim_name": "K. V. Menon (71 yrs)",
        "victim_location": "Kochi, Kerala",
        "state": "Kerala",
        "scam_type": "Digital Arrest",
        "raw_text": "Claimed my FedEx courier contained illegal drugs bound for Canada. Fake magistrate ordered court deposit of Rs. 6,00,000. Phone number: +91-9988112233, UPI handle: gov.rbi.clearance@ybl.",
        "phone_numbers": ["+91-9988112233", "+91-9123456789"],
        "upi_ids": ["gov.rbi.clearance@ybl"],
        "bank_names": ["Axis Bank"],
        "urls": ["http://fedex-customs-clearance-in.com"],
        "amount_lost": 600000,
        "timestamp": "2026-07-22T18:45:00",
        "risk_level": "CRITICAL"
    },

    # --- CLUSTER 2: Banking KYC & PAN Suspension Fraud (Delhi & Maharashtra) ---
    {
        "id": "CMP-2026-9410",
        "victim_name": "Anil Deshmukh (65 yrs)",
        "victim_location": "Dadar, Mumbai",
        "state": "Maharashtra",
        "scam_type": "KYC Expiry Fraud",
        "raw_text": "SMS received: 'Dear SBI Customer, your YONO account is suspended today due to missing PAN verification. Click http://sbi-yono-kycupdate.info or call 9123456789 immediately'. Entered OTP and lost Rs. 95,000.",
        "phone_numbers": ["+91-9123456789"],
        "upi_ids": ["sbisecure.kyc@okaxis"],
        "bank_names": ["SBI"],
        "urls": ["http://sbi-yono-kycupdate.info"],
        "amount_lost": 95000,
        "timestamp": "2026-07-23T08:10:00",
        "risk_level": "HIGH"
    },
    {
        "id": "CMP-2026-9411",
        "victim_name": "Meena Agarwal (59 yrs)",
        "victim_location": "Rohini, New Delhi",
        "state": "Delhi",
        "scam_type": "KYC Expiry Fraud",
        "raw_text": "Fake HDFC netbanking SMS from +91-9123456789. Directed to fake web portal http://sbi-yono-kycupdate.info. Fraudsters withdrew Rs. 1,20,000 via UPI sbisecure.kyc@okaxis.",
        "phone_numbers": ["+91-9123456789"],
        "upi_ids": ["sbisecure.kyc@okaxis"],
        "bank_names": ["HDFC Bank"],
        "urls": ["http://sbi-yono-kycupdate.info"],
        "amount_lost": 120000,
        "timestamp": "2026-07-23T11:20:00",
        "risk_level": "HIGH"
    },

    # --- CLUSTER 3: Electricity Bill Cut-off Panic Scam (West Bengal & Kerala) ---
    {
        "id": "CMP-2026-7205",
        "victim_name": "Subhash Paul (74 yrs)",
        "victim_location": "Howrah, West Bengal",
        "state": "West Bengal",
        "scam_type": "Electricity Power Cut Scam",
        "raw_text": "SMS: 'Dear Consumer, your electricity bill of Rs. 14,800 is overdue. Electricity officer S. K. Roy will disconnect power at 9:30 PM. Call urgent +91-9432109876'. Installed AnyDesk remote control app as instructed.",
        "phone_numbers": ["+91-9432109876"],
        "upi_ids": ["powerpay.wb@ybl"],
        "bank_names": ["PNB"],
        "urls": ["http://wb-electricity-billpay.biz"],
        "amount_lost": 148000,
        "timestamp": "2026-07-21T20:00:00",
        "risk_level": "HIGH"
    },
    {
        "id": "CMP-2026-7206",
        "victim_name": "Latha Nair (66 yrs)",
        "victim_location": "Trivandrum, Kerala",
        "state": "Kerala",
        "scam_type": "Electricity Power Cut Scam",
        "raw_text": "KSEB electricity bill disconnection warning SMS from +91-9432109876. Demanded instant payment to powerpay.wb@ybl. Scammed Rs. 42,000.",
        "phone_numbers": ["+91-9432109876"],
        "upi_ids": ["powerpay.wb@ybl"],
        "bank_names": ["Canara Bank"],
        "urls": ["http://kseb-quickpay-alert.site"],
        "amount_lost": 42000,
        "timestamp": "2026-07-22T21:15:00",
        "risk_level": "HIGH"
    }
]
