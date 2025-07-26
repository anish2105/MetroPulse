from pydantic import BaseModel, Field
import json

class EventSummaryOutput(BaseModel):
    Location: str = Field(description="Location of the event")
    Eventtype: str = Field(description="Classified event type")
    Eventname: str = Field(description="Paraphrased and apt name for the event")
    EventSummarize: str = Field(description="Final summary of the event, incorporating the classified type and any additional relevant information from the search results")


def event_summary_prompt(EVENT_NAME, EVENT_DESCRIPTION, EVENT_LOCATION):
    system_prompt = f"""
    <Inputs>
    $Event name - {EVENT_NAME}
    $Event Description - {EVENT_DESCRIPTION}
    $Event Location - {EVENT_LOCATION}
    </Inputs>

    <Instructions>
    You are an AI assistant tasked with summarizing and classifying events based on user-provided details. You will be provided with details about what is happening around the city. Your job is to summarize users report and produce a blog type of report which consists of users event summarize and also more about the event which will help upcoming readers whether to attend or avoid the event. Here are the steps to follow:

    <Summarize Event>
    First, read through the provided event name, description, and location:

    Event Name: $EVENT_NAME
    Event Description: $EVENT_DESCRIPTION
    Event Location: $EVENT_LOCATION

    Summarize these details in your own words, capturing the key information about the event in a concise manner.

    <scratchpad>
    [Write your summary of the event details here]
    </scratchpad>
    </Summarize Event>

    <Classify Event Type>
    Next, classify the type of event based on the summary you wrote. The event type should belong to one of the following categories:

    - TRAFFIC
    - WATER_LOGGING
    - ATTRACTION 
    - POWER_OUTAGE
    - TECHNICAL_FAULT
    - EMERGENCY
    - ROAD_CLOSURE
    - PUBLIC_GATHERING
    - WEATHER
    - OTHER

    <scratchpad>
    [Provide your reasoning for classifying the event into a particular category]
    </scratchpad>

    Event Type: [Classified event type]
    </Classify Event Type>

    <Search for Additional Information>
    Craft a comprehensive and insightful report about the event, using the provided tool to gather additional context and relevant details. Go beyond the basic user inputs to offer valuable information for future readers.
    Your report should highlight both the advantages and disadvantages of attending or engaging with the event. Tailor the content based on the event type:
    For example, if the event is water logging, offer practical tips such as alternate routes, areas to avoid, or safety precautions.
    If the event is an attraction, explain what it is, how to attend, and outline its key highlights and potential drawbacks.
    Be sure to include a brief and clear summary at the top to quickly inform readers about the nature of the event.
    </Search for Additional Information>

    <Example>
    
    <User Input>
    event_name = "Standup comedy"
    event_description = "Bassi is performing his stand up spl in indiranagar"
    event_location = "Indiranagar, Bengaluru, India"
    </User Input>
    
    <Expected Output>
    ```json
    {{
    "location": "Indiranagar, Bengaluru, India",
    "Event type": "ATTRACTION",
    "Event name": "Anubhav Singh Bassi's Stand-up Comedy Special",
    "Event summary": "Anubhav Singh Bassi, a well-known comedian, is performing his latest stand-up comedy special, 'Kisi Ko Batana Mat,' in Indiranagar, Bengaluru. This show promises an evening of laughter with his signature style of relatable storytelling and hilarious anecdotes drawn from his personal experiences. Tickets are typically available on platforms like BookMyShow and Insider.in, and due to his popularity, they are known to sell out quickly. While the user's input specifies Indiranagar, upcoming dates for Bassi's 'Kisi Ko Batana Mat' special have also been listed at venues like MLR Convention Centre in Whitefield, Bengaluru, so confirming the exact venue for specific dates is advisable. Attending offers a chance to see a popular comedian live and enjoy a fresh set of material. However, some past reviews of his previous specials have noted that the material might occasionally be inconsistent or rely heavily on his narrative style rather than sharp punchlines, and swift booking is essential due to high demand."
    }}
    ```
    </Expected Output>
    
    </Example>

    <Output>
    ```json
    Location: [Location of the event],
    Eventtype: [Classified event type],
    Eventname: [Paraphrased and apt name for the event],
    EventSummary: [Your final summary of the event, incorporating the classified type and any additional relevant information from the search results]
    ```
    </Output>

    
    <Important>
    - Summary should precise and consistent with user's event description.
    - Make only 3-4 paraphrase of information in the event summarize key of the output.
    - The output should be consistent with output structure provided.
    - Do not site any website links. For example - [2,10]
    - Follow the Output Schema
    </Important>

    </Instructions>
    """
    
    user_prompt = f"""
    <Inputs>
    $Event name - {EVENT_NAME}
    $Event Description - {EVENT_DESCRIPTION}
    $Event Location - {EVENT_LOCATION}
    </Inputs>
    
    <Role>
    You are an AI assistant tasked with summarizing and classifying events based on user-provided details. You will be provided with details about what is happening around the city. Your job is to summarize users report and produce a blog type of report which consists of users event summarize and also more about the event which will help upcoming readers whether to attend or avoid the event.
    
    <Output>
    ```json
    Location: [Location of the event],
    Eventtype: [Classified event type],
    Eventname: [Paraphrased and apt name for the event],
    EventSummary: [Your final summary of the event, incorporating the classified type and any additional relevant information from the search results]
    ```
    </Output>

    <Important>
    - Summary should precise and consistent with user's event description.
    - Make only 3-4 paraphrase of information in the event summarize key of the output.
    - The output should be consistent with output structure provided.
    - Follow the Output Schema
    - Do not site any website links. For ewxample - [2,10]
    </Important>
    
    """
    
    return system_prompt, user_prompt


def merge_summary(EVENT_SUMMARY , MEDIA_SUMMARY):
    system_prompt = f"""
    <Inputs>
    event_summary - {EVENT_SUMMARY}
    media_sumary - {MEDIA_SUMMARY}
    </Inputs>

    <Instructions>
    Your task is to create a comprehensive summary that combines information from two sources - an event summary based on a user's text description, and a media summary generated from an image the user uploaded depicting the same event.
    </Instructions>
    
    <Task>
    
    To begin, review the following event summary:
    {EVENT_SUMMARY}

    Next, examine this media summary based on analyzing the user's uploaded image:
    {MEDIA_SUMMARY}

    The event and media summaries provide useful context, but you may need additional details to create a truly comprehensive overview. To find this supplemental information, use the following Google Search tool:
    What additional details would help provide more context about this event? Make a bulleted list of topics you could search to find relevant information.
    Review the search results carefully. When you feel you have enough information, synthesize the event summary, media summary, and any relevant details from your searches into a single comprehensive paragraph summarizing the entire event.

    Ensure your comprehensive summary covers all the key details and contexts about the event from the various data sources provided. The goal is to create a rich, informative overview that captures everything of importance.
    </Task>
    
    <Output>
    ```json
    summary : comprehensive summary
    ```
    </Output>
    
    <Output structure>
    - Summary should cover all the points from event and media summary
    - Make the summary more extensible for the user to understand about the event and take his further steps on the same.
    </Output structure>
    """
    user_prompt = f"""
    <Inputs>
    event_summary - {EVENT_SUMMARY}
    media_sumary - {MEDIA_SUMMARY}
    </Inputs>

    <Instructions>
    Your task is to create a comprehensive summary that combines information from two sources - an event summary based on a user's text description, and a media summary generated from an image the user uploaded depicting the same event.
    </Instructions>
    
    <Output>
    ```json
    summary : comprehensive summary
    ```
    </Output>
    
    <Output structure>
    - Summary should cover all the points from event and media summary
    - Make the summary more extensible for the user to understand about the event and take his further steps on the same.
    </Output structure>
    """
    return system_prompt, user_prompt 

