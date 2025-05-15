# Final Project Report

Asen Ou (ako28) and Peter Bidoshi (pjb294)
# Goals & Motivation

One of the primary goals of "Meme Trends: The Last Year" is to visualize and track
meme trends throughout the past year. This project offers users a comprehensive tool to
compare different memes based on their popularity over time and other metrics like their
views or brainrot score. By charting the rise and fall of various viral internet memes, this
project aims to provide qualitative and quantitative insight into the historical context of
how they evolve, spread, and inflfluence online culture. This analytical approach helps users
understand the lifecycle of memes and identify patterns in their popularity, offering both
entertainment and analytical value. Ultimately, the project seeks to be a light-hearted data
visualization, focusing on providing users with an enjoyable experience while still delivering
usability and insight into the rapidly changing landscape of meme culture.
# Intended Use Case

This data visualization is crafted for anyone curious about exploring and reminiscing
over past meme trends, especially in today's fast-paced social media world. Given that
memes often enjoy a flfleeting moment in the spotlight before fading into internet history,
our tool offers a fun way to rediscover forgotten favorites, trace the journey of viral
content, and get a better sense of why certain memes captured the collective imagination
when they did. Whether it's for a bit of casual browsing, some light research, or just a trip
down memory lane, this tool aims to be an accessible and intuitive guide to the vibrant

world of internet culture.
# Related Material

Our journey in creating "Meme Trends: The Last Year" was sparked by several
existing platforms and ideas: A cornerstone for our qualitative data and understanding the
lore behind each meme was KnowYourMeme (KYM): the platform’s vast database on meme
origins and cultural impact provided the rich contextual flflavor for our project. We wanted to
take KYM's encyclopedic strength and blend it with a more dynamic, visual way to see how
these trends flflow. For the quantitative side of things (tracking how meme popularity shifts
over time) we turned directly to Google Trends data. For our design, we drew some
inspiration from other data visualization projects that tackle trend analysis in various fifields.
For instance, the design of our "Timeline Visualizer" was particularly inflfluenced by a data
visualization we encountered in class that depicted researchers and their publications: it

was a visually cluttered line chart where each line represented an individual researcher,
and points along that line marked their various research papers, which sparked ideas for
how we might build upon this to represent individual meme lifecycles. Overall, our main

goal was to bring together KYM's qualitative analysis, Google Trends' quantitative analysis,
and a user-friendly interface that makes exploring meme history an engaging interactive
experience.
# Data Source

To bring "Meme Trends: The Last Year" to life, we took a two-step process for
gathering our data. First, we went web scraping on KnowYourMeme, using BeautifulSoup to
collect meme details (website URL, image URL, page views, about section, origin section,
and related TikToks) from their meme profifile pages. Next, we tapped into the Google Trends
API, using the meme titles sourced from KYM to analyze their popularity and search
interest over a 3 month and 1 year period. This allowed us to capture both the stories and
cultural context behind each meme (the qualitative side) and the numbers showing their
rise and fall in popularity (the quantitative side). Towards fifinalizing the dataset, some
manual intervention was necessary: we gave each meme a “brainrot score” as a
sentimental measure of how nonsensical and abstract a meme is, and we looked through all
the meme images, replacing some that we believe do not best represent the meme. The
fifinal datasets was compiled using Pandas dataframes and operations, and covers a range
of popular memes from the past year, packing in essential details like meme names, an
about section with their creation dates, a detail of their origin, images, KYM website views,
brainrot score, related TikToks, and a timeline of their popularity (trend score). The
qualitative data from KYM helped us build a detailed popup view of each meme while the
quantitative data from the Google Trends API allowed us to create timeline visualizations.
# Design Process

Our initial vision for the project, captured in an early sketch (Fig 1.), imagined a user
journey built around a scrolling exploration of meme history. The page was planned to on
board the user with a friendly introduction to the project and modern memes. This would
lead into an "Explore" section, essentially a browsable catalog where users could pick
memes to see their detailed backstories. Any memes a user selected would then carry over
to the "Interact" section. Here, the idea was for users to play with a (potentially 3D) line
chart showing meme popularity over time, with a smaller catalog on the left for quick
selections, and a close-up profifile view of a chosen meme to the right. A fifiltering
mechanism would also be under the graph, allowing users to fifilter through the catalog.

![](fpreport.pdf-2-0.png)

​
Fig 1. Initial Sketch

This initial concept was our starting block, a launchpad for further idea:

![](fpreport.pdf-2-1.png)

Fig 2. Final Design: Brainrot Quiz

![](fpreport.pdf-3-0.png)

Fig 3. Final Design: Timeline Visualizer and Scatterplot

![](fpreport.pdf-3-1.png)

Fig 4. Final Design: Popularity Over Time Comparison + Meme Catalog Interaction

While the fifinal application evolved into a more consolidated single-page dashboard
rather than a long scrolling page, several core elements from this early vision were carried
forward. We thought a simple onboarding as shown in our initial sketch (Fig 1.) would be

boring and not fifit the theme of memes. Then, we remembered a meta-meme called the “AP
Brainrot Quiz/Exam” where users had to guess certain memes to receive a brainrot score.
Using this as inspiration, we made a brainrot quiz (as seen in Fig 2.) as part of the user
onboarding, allowing them to playfully gauge their familiarity with modern memes. The
"Explore" section's browsable catalog directly translated into the fifixed meme catalog
featured on the left in our fifinal design (as seen in Fig 2~4.). We realized we could eliminate
the need for two catalogs as shown in our initial sketch (Fig 1.) by having a fifixed one that
persists throughout the scrolling of the page. The idea of selecting a meme for a "detailed
synopsis" is realized through the profifile modal that appears when a meme is clicked (an
example of a tooltip leading to this is visible in Fig 4., showing "Tung Tung Tung Sahur"
details), providing its "About" and "Origin" details from Know Your Meme, along with related
TikToks. The "Interact" section's line chart is central to our fifinal application, manifesting as
both the main "Timeline Visualizer" (Fig 3.) and the more focused "Popularity Over Time
Comparison" chart (Fig 4.), where users can drag memes from the catalog into the chart to
compare their trends.
# Final Design Justifification & Implementation

The fifinal design of "Meme Trends: The Last Year" was developed from our initial
sketches into a dynamic and interactive single-page application. The user interface is
organized into several interconnected modules. The application interface includes a basic
introduction and an engaging brainrot quiz (Fig 2.), designed as an initial point of user
engagement. A fifixed meme catalog (visible in Fig 2.~4.) then allows users to browse the
meme collection, offering search and sort capabilities alongside thumbnail previews and
key metrics such as "KYM Views" and our custom "Rot Score." The central "Timeline
Visualizer" (Fig 3.), a line chart that displays their Google Trends popularity scores over
time, is complete with an automatic animation or manual scrolling option to navigate it and
a section highlighting "Peaked Memes." To provide an alternative analytical perspective, a
scatter plot titled "Meme Views vs. Brainrot Score" (Fig 3.) visualizes the relationship
between KYM views (utilizing a log scale for clarity) and the "Rot Score." Lastly, a dedicated
"Popularity Over Time Comparison" chart (Fig 4.) allows for a more focused examination of
the trends of selected memes, featuring controls for different time windows ("Last 3
Months" & "Last Year") and a clear interactive legend (clicking on a legend removes the
associated meme from the graph). We employed various visual channels, including meme
images, descriptive text, color-coded line graphs, and intuitive icons, while interactions
include standard clicks and scrolls, as well as drag-and-drop functionality for comparing
memes in the "Popularity Over Time Comparison" chart.

The development of the fifinal design was an iterative process, signifificantly informed
by user feedback and collaborative refifinement. For instance, initial feedback during demo
day highlighted that the meme catalog lacked a search mechanism; consequently, we
implemented a search bar to enable users to quickly locate specifific memes. We also
received feedback regarding the "Popularity Over Time Comparison" graph, where users
expressed a desire to see the exact date at the dashed vertical line (appears when hovering

on graph). This was addressed by adding a feature where upon hovering, the specifific date
is displayed at the top of the dashed vertical line that appears at the cursor. Another
valuable piece of feedback concerned the "Timeline Visualizer" and its "Peaked Memes"
section. Initially, the correspondence between the three highlighted timelines and the
memes in the "Peaked Memes" list was not immediately clear. To resolve this, we introduced
a color-coding system, employing Gold, Silver, and Bronze colors (along with 🥇, 🥈, 🥉
emojis) to visually link the top three trending lines on the visualizer to their respective
entries in the "Peaked Memes" display. Furthermore, to improve the identifification of
individual lines within the line-dense Timeline Visualizer, an on-hover effect was added that
not only highlights the hovered timeline but also displays a tooltip with that meme's details.
Feedback also indicated a need for clearer affordance on how to interact with the
"Popularity Over Time Comparison" graph. This was addressed by implementing a speech
bubble that appears when hovering over a list element with the prompt "Click or Drag me!"
to guide users.

In making design decisions, we addressed several key trade-offs, particularly
concerning visual presentation and information density. A primary challenge was the
"Timeline Visualizer," where displaying numerous meme trend lines risked creating a
cluttered interface. To mitigate this, we employed several strategies: we used distinct
colors for highlighted memes (Top 3 or hovering memes), de-emphasized less relevant or
unselected trend lines by rendering them in a muted gray, and incorporated hover effects
that highlight a specifific line and provide tooltip details for better identifification. However,
even with these measures, displaying an extensive number of selected memes still test the
limits of visual clarity. The "Popularity Over Time Comparison" chart serves as an
alternative, more focused, and less visually dense environment when users can compare a
smaller subset of memes. The choice of a dark theme was made to help visualizations
stand out and reduce eye strain during exploration, though we recognize this might not be
a universal preference. These decisions reflflect a continuous effort to balance the richness
of the data with an intuitive and aesthetic user experience. Lastly, our custom "Rot Score,"
while intended as an engaging metric, is inherently subjective and primarily intended for

entertainment.

Finally, here are some screenshots to show our implementation:

**Brainrot Quiz:**

![](fpreport.pdf-5-0.png)

![](fpreport.pdf-5-1.png)

![](fpreport.pdf-5-2.png)

​ Correct ​ ​ ​ Incorrect ​ ​ ​ ​ Quiz Over

**Meme catalog:**

![](fpreport.pdf-6-0.png)

Cursor hovering over Galvanized Square Steel

**Timeline Visualizer & Peaked Memes:**

![](fpreport.pdf-6-1.png)

Hovering over AI Rick Laughing timeline

**Meme Views vs. Brainrot Score:**

![](fpreport.pdf-6-2.png)

Hovering over Tung Tung Tung Sahur data point

**Popularity Over Time Comparison:**

![](fpreport.pdf-7-0.png)

![](fpreport.pdf-7-1.png)

Draggin Hawk Tuah Girl into the graph ​ Dropping Hawk Tuah Girl into the graph

**Meme Profifile Modal:** **​**

![](fpreport.pdf-7-2.png)

![](fpreport.pdf-7-3.png)

![](fpreport.pdf-7-4.png)

Profifile modal of Tung Tung Tung Sahur
# Contribution

Peter:

         - ​ Scraped and cleaned the necessary data from the KnowYourMeme websites

through a script

         - ​ Created main visualizations for presentation:

         - ​ Scrollable meme catalog with fifiltering by views, brainrot score, or

alphanumerical order

         - ​ Brainrot quiz with randomly selected memes and answer choices

         - ​ Timeline Visualizer explorable through scrolling or auto playing with a

button

         - ​ Peaked Memes section to the right of the Timeline Visualizer showing

the top 3 memes at the instance the visualizer is at

         - ​ Meme Views vs. Brainrot Score scatterplot

         - ​ Popularity Over Time Comparison line chart with a toggleable Last 3

months or Last Year view

Asen:

   - ​ Changed parts of the data that required manual intervention

         - ​ Assign brainrot scores

         - ​ Find replacement images for certain memes.

   - ​ Refifined the design of data visualizations after feedback:

         - ​ In the meme catalog (left side), added a search bar with basic

searching mechanism, and a “Click or Drag me!” speech bubble that
appears on hover.

         - ​ In Timeline Visualizer, added color coding for top 3 memes, feature

showing meme detail on hover and opening profifile modal on click for

all timelines.

         - ​ In Peaked Memes, added the same things as in Timeline Visualizer

(color coding, on hover, on click).

         - ​ In Meme Views vs. Brainrot Score, feature showing meme detail on

hover and opening profifile modal on click for all data points

         - ​ In Popularity Over Time Comparison, added a remove all button in the

legend, a date element above the dashed vertical line, and the same

on hover & on click features for the timelines as those in the Timeline

Visualizer.

   - ​ Prepared and wrote the fifinal report

