from celery import shared_task
from models import *
import flask_excel as excel
import csv
from smtplib import SMTP
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from jinja2 import Template
from datetime import datetime,timedelta
import os
import logging
import time 
SMTP_HOST='localhost'
SMTP_PORT=1025
SENDER_EMAIL='admin@email.com'
SENDER_PASSWORD=''

from json import dumps
from httplib2 import Http







import csv
from datetime import datetime
import os

@shared_task(ignore_result=False)
def create_resource_csv():
    """
    Generates a CSV file containing campaign data.
    """
    try:
        campaigns = Campaign.query.all()

        # Prepare data for CSV using dictionaries
        campaign_data = []
        for campaign in campaigns:
            campaign_data.append({
                'ID': campaign.id,
                'Title': campaign.title,
                'Brand': campaign.brand.name if campaign.brand else "N/A",
                'Description': campaign.description if campaign.description else "N/A",
                'Start Date': campaign.start_date.strftime('%Y-%m-%d') if campaign.start_date else "N/A",
                'End Date': campaign.end_date.strftime('%Y-%m-%d') if campaign.end_date else "N/A",
                'Budget': f"${campaign.budget:,.2f}" if campaign.budget else "N/A",
                'Status': campaign.status if campaign.status else "N/A",
                'Goals': campaign.campaign_goals if campaign.campaign_goals else "N/A",
                'Target Audience': campaign.target_audience if campaign.target_audience else "N/A",
                'Private': "Yes" if campaign.private else "No",
            })

        # Create a directory to store CSV files if it doesn't exist
        csv_files_dir = 'csv_files'
        os.makedirs(csv_files_dir, exist_ok=True)

        # Generate a unique filename
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f'Campaigns_{timestamp}.csv'
        filepath = os.path.join(csv_files_dir, filename)

        # Write data to CSV
        with open(filepath, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.DictWriter(file, fieldnames=campaign_data[0].keys())
            writer.writeheader()
            writer.writerows(campaign_data)

        return filename  # Return the generated filename

    except Exception as e:
        # Log the error
        print(f"Error creating CSV: {e}")  # Replace with proper logging
        return None








def send_email(to,subject,content_body):
    msg=MIMEMultipart()
    msg['To']=to
    msg['Subject']=subject
    msg['From']=SENDER_EMAIL
    msg.attach(MIMEText(content_body,'html'))

    client=SMTP(host=SMTP_HOST,port=SMTP_PORT)
    client.send_message(msg=msg)
    client.quit()










@shared_task(ignore_result=False)
def daily_reminder():
    timestamp = datetime.utcnow() - timedelta(hours=24)
    # Fetch users who haven't visited in the last 24 hours
    not_visited_users = User.query.filter(User.last_activity < datetime.utcnow()).all()
    
    if not not_visited_users:
        return "No inactive users today"
    
    for user in not_visited_users:
        username = user.username
        
        # Check if the user is not the admin
        if username != 'admin':
            send_notification(username)

    return 'Notification sent to users'






@shared_task(ignore_result=True)
def monthly_reminder():
    # --- Send reminders to Influencers ---
    influencers = Influencer.query.all()

    with open('influencer_reminder.html', 'r') as f:
        influencer_template = Template(f.read())

    for influencer in influencers:
        proposals = influencer.proposals
        if proposals:
            email_content = influencer_template.render(
                email=influencer.user.email,
                username=influencer.user.username,
                proposals=proposals
            )
            try:
                send_email(influencer.user.email, 'Your Monthly Proposal Summary', email_content)
            except Exception as e:
                print(f"Failed to send email to {influencer.user.email}: {e}")

    # --- Send reminders to Brands ---
    brands = Brand.query.all()

    with open('brand_reminder.html', 'r') as f:
        brand_template = Template(f.read())

    for brand in brands:
        campaigns = brand.campaigns
        if campaigns:
            email_content = brand_template.render(
                email=brand.user.email,
                brand_name=brand.name,
                campaigns=campaigns
            )
            try:
                send_email(brand.user.email, 'Your Monthly Campaign Summary', email_content)
            except Exception as e:
                print(f"Failed to send email to {brand.user.email}: {e}")

    return "Monthly Reminders Sent"








def send_notification(username):
    url = 'https://chat.googleapis.com/v1/spaces/AAAA76ytUGA/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=xYFAe_YD6XsrO2N4gFrAovGNNE-KwGC-HiViB5SpW4I'
    
    app_message = {
        'text': f'''Hello {username}! 

There's exciting news in your Influencer App! ✨

- New campaigns are waiting for your proposals! 
- Brands are searching for influencers with your niche! 
- Check out your latest performance stats and watch your influence grow! 

Log in now and make your mark! 
''' 
    }
    
    message_headers = {"content-type": "application/json;charset=UTF-8"}
    http_obj = Http()
    response = http_obj.request(
        uri=url,
        method="POST",
        headers=message_headers,
        body=dumps(app_message) 

    )