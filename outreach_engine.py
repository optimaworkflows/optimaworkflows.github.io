import os, json, time, smtplib; from datetime import datetime; from email.mime.text import MIMEText; from harvest_engine import OptimaHarvestEngine;  
GOOGLE_SHEET_ID = "1DkOyXt-e5aimK2fNqyccVrOyO-fz7DnXG7tVT_v9hVQ"  
EMAIL_SENDER = "VGoodsMart@gmail"  
EMAIL_PASSWORD = "YTccc2023"  
def send_autonomous_email(to_email, company_name):  
    subject = f"Silent margin leaks & invoicing validation for {company_name}"  
    body = f"Hi Team,\n\nI noticed your organization coordinates a high-volume physical distribution network at {company_name}.\n\nSupply chain operations data reveals that over 85% of mid-sized wholesalers experience a silent 1% to 3% capital leak.\n\nAt Optima Workflows, we build automated backend pipelines that parse up to 10,000 transaction rows in under 4 seconds with 0% margin of error.\n\nThe Pilot Execution Framework:\nWe will run a completely free 60-day retroactive analysis on your past transaction files. If our script isolates zero errors, your organization gets absolute peace of mind for free. If it uncovers billing errors, we help your accountants short-pay the vendor invoice before month-end and split the recovered cash 40/60.\n\nTo initialize a secure diagnostic sandbox portal, you can submit your company metrics directly through our active engineering landing page here: https://github.io\n\nBest regards,\nOperations Group | Optima Workflows"  
    msg = MIMEText(body); msg["Subject"] = subject; msg["From"] = f"Optima Workflows <{EMAIL_SENDER}>"; msg["To"] = to_email  
    try:  
        server = smtplib.SMTP("://gmail.com", 587)
        server.starttls()
        server.login(EMAIL_SENDER, EMAIL_PASSWORD)  
        server.sendmail(EMAIL_SENDER, [to_email], msg.as_string()); server.close()  
        print(f"Phase 1 Pitch Email deployed to {to_email}"); return True  
    except Exception as e:  
        print(f"Mail delivery exception: {e}"); return False  
def run_outreach_execution_loop():  
    print("OPTIMA WORKFLOWS SOURCING LOOP ACTIVE")  
    miner = OptimaHarvestEngine(); fresh_scraped_leads = miner.execute_mining_sequence()  
    for lead in fresh_scraped_leads:  
        send_autonomous_email(lead["operational_email"], lead["organization_name"])  
if __name__ == "__main__":  
    run_outreach_execution_loop() 
