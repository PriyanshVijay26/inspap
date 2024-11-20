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







@shared_task(ignore_result=False)
def create_resource_csv():
    """
    Generates a CSV file containing campaign data.
    """
    try:
        campaigns = Campaign.query.all()

        # Prepare data for CSV
        campaign_data = []
        for campaign in campaigns:
            campaign_data.append({
                'Title': campaign.title,
                'Brand': campaign.brand.name,
                'Description': campaign.description,
                'Start Date': campaign.start_date.strftime('%Y-%m-%d') if campaign.start_date else None,
                'End Date': campaign.end_date.strftime('%Y-%m-%d') if campaign.end_date else None,
                'Budget': campaign.budget,
                'Status': campaign.status,
                'Goals': campaign.campaign_goals,
                'Target Audience': campaign.target_audience,
                'Private': campaign.private
            })

        # Generate CSV
        csv_output = excel.make_response_from_query_sets(
            campaign_data,
            ['Title', 'Brand', 'Description', 'Start Date', 'End Date', 'Budget', 'Status', 'Goals', 'Target Audience', 'Private'],
            'csv'
        )

        # Create a unique filename using timestamp to avoid overwriting
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f'Campaigns_{timestamp}.csv'

        # Create a directory to store CSV files if it doesn't exist
        csv_files_dir = 'csv_files'  # You can change this to your desired directory name
        os.makedirs(csv_files_dir, exist_ok=True)

        # Construct the full file path
        filepath = os.path.join(csv_files_dir, filename)

        with open(filepath, 'wb') as f:
            f.write(csv_output.data)

        return filename  # Return the filename so it can be accessed later

    except Exception as e:
        # Log the error or raise it again if needed
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
def daily_remainder():
    timestamp = datetime.utcnow() - timedelta(hours=24)
    # Fetch users who haven't visited in the last 24 hours
    not_visited_users = User.query.filter(User.last_activity < timestamp).all()
    
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
    url = 'https://chat.googleapis.com/v1/spaces/AAAAs_Ud758/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=2-_o7I0Y-qamuAdRV4ExKj5PuixNDH4VMgJgCKAHTWc'
    
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