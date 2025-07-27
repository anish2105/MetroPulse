from overall_summary import get_overall_summary
from event_summary_agent import get_event_summary
from media_summary_agent import analyze_media_files
from prompts import event_summary_prompt, media_prompts, merge_summary

event_name = "Standup comedy"
event_description = "Bassi is performing his stand up spl in indiranagar"
event_location = "Indiranagar, Bengaluru, India"

media_file = [
        r"D:\Projects\GenAI\Metropulse\Backend\local_media\bassi_1.mp4",
        r"D:\Projects\GenAI\Metropulse\Backend\local_media\bassi_image2.jpg",
        r"D:\Projects\GenAI\Metropulse\Backend\local_media\bassi_image1.jpg"
]




event_system_prompt, event_user_prompt = event_summary_prompt(event_name,event_description, event_location)
media_system_pompt, analysis_media_prompt = media_prompts()

event_summary_result = get_event_summary(event_user_prompt, event_system_prompt)
print("="*60)
print(event_summary_result)
print("="*60)

media_summary_result = ""

if media_file is  not None:
    media_summary_result = analyze_media_files(media_file, media_system_pompt, analysis_media_prompt)
    print("="*60)
    print(media_summary_result)
    print("="*60)

merger_system_prompt,merger_user_prompt = merge_summary(event_summary_result, media_summary_result)

merger_summary_result = get_overall_summary(merger_user_prompt, merger_system_prompt)
print("="*60)
print(merger_summary_result)
print("="*60)
