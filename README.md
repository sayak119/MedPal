# MedPal

![Logo](logo.jpg)

## Inspiration

Not taking medications properly leads to unnecessary hospital admissions, illness, and even deaths. It also costs the health care system **billions of dollars** every year, in costs both direct (for example: hospitalisations) and indirect (for example: lost productivity). For example, about **5%** of hospital admissions result directly from not taking medications as recommended.

Also **overdose** of medications (both **intentional** and **unintentional**) causes around **190,000** deaths per million people worldwide. Most affected people of unintentional medical over dosage or under dosag are people who have -

* Parkinson's disease
* Dementia
* People too busy with their day to day schedule.
* New moms
* Anxiety

Also this can be used by in home nurses and the family members of the above mentioned groups to keep a check on the intake of the medicines. 

## What it does

Instead of remembering all the medicine names, their respective intake dates, amount and the next date of intake, we only need to remember **Alexa, open Med Pal**. What all things can it do?

**First of all add the medicine that you consume**

* **Adding of medicine to the schedule**:
add <medicine-name>

* **Adding the amount of medicine to be taken**: 
I need to take 2 drops

* **Frequency of the medications**:
I will be taking it every 3 days

* **Number of days for which it will be taken**:
for 15 days

* **To check your today's schedule of meds**:
what do i need to take today

* **To confirm that the medicine has been consumed**:
took my <medicine name> today

* **To buy the amount of medicines and list of medicines on any date**:
list off my meds for thirteenth august two thousand eighteen

* **To create a report of the missed mediciness and taken mediciness** (Will help doctors and caregivers take precautions before taking any further steps):
give me a report for august 7 2018

* **To reset**:
reset everything

We also added features like **frequency** of intake of medicines and the **number of days** one has to take it so that the amount of medicine that needs to be bought can be calculated, hence try to **prevent over dosage** of medicines. 

The family members and/or caregivers can also **generate a report** regarding the medicines that weren't taken and consult the doctors on what to do next. In this way, the dosage can be altered (if needed) and thus prevent under dosage of medicines. It also helps the family members to keep a check on the person who is under medical supervision and also as a self-check for general public.

## How I built it

We built it using AWS Lambda and Dynamodb. Also we needed to scrape off the medicine names from multiple websites for the slot value containing the medicine names. Dynamodb acts as **memory** for Med Pal. We also had to keep a check for medicine taken or not which played a vital role in report generation and day to day medicine schedule.

## Challenges I ran into

The main challenges were handling sessions and adding the report generation part along with keeping a flag for keeping a track of whether the medicine was taken or not. Also laws governing publication of such skills.

## Accomplishments that I'm proud of

**It works** and it got accepted in the Alexa skill store :-)

## What's next for Med Pal

We really want to add a feature which allows doctors to keep a track of their patients and send them a report accordingly and also to book an appointments and visits to the doctors.

