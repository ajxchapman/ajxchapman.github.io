---
layout: post
title: On Full-Time Bug Bounty Hunting
category: bugbounty
---

When I introduce myself to others in the IT Security industry as a full-time Bug Hunter getting paid through Bug Bounties, they often have many questions (when I do this to people outside the industry they look at me funny and fake reasons to excuse themselves). In this post I reflect on my experiences after 12 months bug hunting for my primary source of income, and try to answer some of the more common questions I receive.

<!--more-->

<style>

@media (min-width: 800px) {
  .pros {
    margin-left: -20px;
    margin-right: 20px
  }

  .cons {
    margin-left: 20px;
    margin-right: -20px;
  }
}

.pros {
  background-color: #f9fff5;
}
.cons {
  background-color: #fff5f5;
}

.ttable {
  width: auto !important;
  display: table !important;
  margin-left: auto;
  margin-right: auto;
}

.tpoint {
  margin-top: 1em;
  padding: 0.5em;
  border: 1px solid #e8e8e8;
  border-radius: 5px;
}
</style>


# My Story
Hi, I'm Alex or [@ajxchapman](https://twitter.com/ajxchapman) on pretty much all social media. I am in my mid-30s (ouch), living in London (England) with my wife and our dog (West Highland Terrier). It's a pleasure to meet you.

<img style="display: block; margin-left: auto; margin-right: auto; border-radius: 50%;" src="{{ site.url }}/assets/avatar.jpg" />

I completed a Computer Science BSc in 2007 and started working as a Penetration Tester straight out of University for Deloitte in their Enterprise Risk Services business group. After a few years there I moved to a smaller penetration testing consultancy, Context Information Security, where I stayed for 6 years doing penetration testing, red teaming and security research. With ~10 years experience as a Penetration Tester I got an offer to move into an internal Red Team position at Yahoo, who were subsequently acquired by Verizon under the Oath brand. It was at Yahoo where I had my first real exposure to modern bug bounty. Here I joined the team responsible for assessing the technical and business impact of bug reports received through the public Yahoo bug bounty program. With just over a year at Yahoo I accepted an opportunity to work at HackerOne to help other companies setup and run successful bug bounty programs. Throughout my time at Yahoo and HackerOne I started bug hunting and reporting bugs to bug bounty programs in my spare time, with some good initial success.

Sadly, at this time my personal life took an unexpected turn. My wife, Rebecca, and I were expecting a child, and we learned in early April 2018 that our unborn daughter had a chromosomal disorder known as Edward's Syndrome. This ultimately meant we would lose our child before or shortly after she was born. We lost Chloë in August 2018 shortly before her due date. For anyone who would like to understand more about this experience, Rebecca wrote an <a href="https://www.facebook.com/becca.trumper/posts/10102998321397050" target="_blank">overview of our difficult journey</a>. HackerOne, as my then employer, were fantastic during this time, giving me the support and time off to grieve, but ultimately when returning to work in early January 2019 it was clear I still needed time to get myself back on track, so I decided to hand in my notice.

It was around this point I decided to give full-time bug hunting a real chance as it would allow me the flexibility and space to continue to look after my own mental health, support my family as well as potentially earn good money.

# Money and Work Commitment
Not surprisingly, since starting bug hunting as a full-time profession I'm often asked questions regarding money, expected earnings and the sustainability of full-time bug hunting.

When starting out, I was fortunate to be in a stable financial situation, allowing me to survive a few initial bad months if they occurred. I had modest savings and my wife worked a good job which could cover our outgoings if required. This significantly reduced the risk for me starting out in this venture.

I set myself a monthly target of $10,000 USD from bug bounty earnings. This target was calculated roughly considering my previous salaries, expected salary if I were to go back into employment, outgoings, financial commitments and quality of life factors (also because it was a nice round number). My aim was to meet this financial target working roughly two to three weeks each month, allowing me to take time off to look after myself and my family as required.

In order to meet these targets, I generally focus my efforts on identifying high and critical impact issues on high paying bug bounty programs. In general bug hunting I do report some medium impact issues, especially if I come across them whilst looking for or chaining higher impact issues, but don't usually report lower impact issues. I modify this tactic slightly when submitting bugs against targets at Live Hacking Events, where I am more inclined to hunt for and submit all impacts of bugs. I previously released some [statistics of the bugs I reported in 2019]({% post_url 2020-01-01-bug-hunting-year-in-review %}), which gives some more insight into my bug hunting style.

[![Income From Impact]({{ site.url }}/assets/bug-hunting-2019/5.png)]({% post_url 2020-01-01-bug-hunting-year-in-review %})
<div style="margin-top: -1.5em; text-align: right; font-style: italic; font-size: 0.9em;">Sample statistics from <a href="{% post_url 2020-01-01-bug-hunting-year-in-review %}">Bug Hunting Year in Review - 2019</a></div>

I am happy to say that one year into this journey I am more than meeting my self imposed targets. This has allowed me to choose the focus of my work based on my technical preferences and have a lot of flexibility in how I choose to work.

# Pros and Cons of Bug Hunting
<table class="ttable">
  <tr>
    <th>Pros</th>
    <th>Cons</th>
  </tr>
  <tr>
    <td>
<ul>
  <a href="#pros_flexibility"><li>Flexibility</li></a>
  <a href="#pros_community"><li>Community</li></a>
  <a href="#pros_independence"><li>Independence</li></a>
  <a href="#pros_variability"><li>Variability</li></a>
</ul>
    </td>
    <td>
<ul>
  <a href="#cons_financialrisk"><li>Financial Risk</li></a>
  <a href="#cons_uncertainty"><li>Uncertainty</li></a>
  <a href="#cons_isolation"><li>Isolation</li></a>
  <a href="#cons_burnout"><li>Burnout</li></a>
</ul>
    </td>
  </tr>
</table>

<div class="tpoint pros" id="pros_flexibility">
Bug hunting provides me the <b>flexibility</b> I need at this point in my life, something which full-time employers simply can't be expected to match. I can work on my good days, and take time off on my bad days. I can work at 0600 or 2300. If I am in a position where I am comfortably hitting my targets I can take time off, reduce my working hours or invest my time in learning or programming. Alternatively I can continue to work and earn more money in order to get ahead on my targets, or simply to have more money.
</div>

<div class="tpoint cons" id="cons_financialrisk">
That being said, full-time bug hunting carries not inconsiderable <b>financial risk</b> (yes the money is both a pro and a con). As bug bounty programs generally pay on a results basis, if I don't find any bugs I don't get paid. This can lead to frustrating weeks where many hours are spent working, but without any kind of financial reward. This can obviously add financial strain which I would not have with a salaried position.
</div>

<div class="tpoint pros" id="pros_community">
The Bug Bounty <b>community</b> is a great source of knowledge, encouragement and support. There are a lot of talented bug hunters on social media, with an increasing number choosing to do bug hunting full-time. With live streams and Q&As from <a href="https://www.twitch.tv/nahamsec" target="_blank">@NahamSec</a>, tools from <a href="https://www.github.com/tomnomnom" target="_blank">@Tomnomnom</a> and technique and bug write ups from the likes of <a href="https://www.twitter.com/orange_8361" target="_blank">@orange_8361</a>, <a href="https://www.twitter.com/albinowax" target="_blank">@albinowax</a>, <a href="https://www.twitter.com/samwcyo" target="_blank">@samwcyo</a> (to name but a few) there is a huge amount of resources to learn from for all levels of experience. With the HackerOne Hactivity added on top, there is no excuse for me not keep up to date on the latest bug techniques.
</div>

<div class="tpoint cons" id="cons_uncertainty">
Financial strain can be compounded by the <b>uncertainty</b> of not knowing how much, and in what timeframe I will be paid for the reports I submit. Working on programs with clear payout scales and fast payment times can mitigate this somewhat, but there will always be a level of uncertainty. I try to calculate using lower bounds of bounty payouts and higher bounds on payment times when doing any forecasting, that way I'm not caught out by low bounty payouts which take a long time to come through, and have the benefit of better than expected months if any of my reports pay out on the higher end of the scale.
</div>

<div class="tpoint pros" id="pros_independence">
Bug hunting provides an excellent opportunity for <b>independence</b>, to work for myself and be my own boss, as opposed to working for an employer. In this model all income goes directly to me (minus taxes of course), rather than making money for someone else with my hard work.
</div>

<div class="tpoint cons" id="cons_isolation">
Social <b>isolation</b> can be a real problem for any remote worker, but especially so for solo bug hunters. As a self described introvert, this is not such a big problem for me, but I do sometimes feel the need to just get out and find someone (anyone) to talk to. The real problem here is not working directly alongside other people with similar or complementary skill sets, in order to bounce ideas around or work on problems together. Remote collaboration with other hackers can help, but is not quite the same as a skilled team in the same office all working on the same problem collaboratively. I have some ideas on how to at least partially address this in the future, but they are all squarely on my TODO pile at the moment.
</div>

<div class="tpoint pros" id="pros_variability">
The <b>variability</b> of bug hunting really appeals to me. If I get frustrated or am not having success hunting for bugs on a web application, I can switch to reverse engineering a Windows application for another program. I can work with finance companies one day, and gaming companies the next. And I can do all of this without having to bid for freelance jobs, write contracts or secure customers. Bug bounty platforms, such as <a href="https://hackerone.com" target="_blank">HackerOne</a> and <a href="https://bugcrowd.com" target="_blank">Bugcrowd</a>, have a huge number of bug bounty programs to choose from at any time.
</div>

<div class="tpoint cons" id="cons_burnout">
Excessive stress and <b>burnout</b> are very common with bug hunting, compounded if you are not meeting your financial targets. It is very easy to focus too much time on bug-hunting, neglecting other aspects of life, which can easily result in burnout. I have had multiple periods of several weeks where I haven't felt able to work at all resulting directly from too much time bug hunting and not enough time looking after myself. <a href="https://twitter.com/nathonsecurity" target="_blank">@NathOnSecurity</a> has written a good overview of mental health considerations doing bug bounty work I highly recommend you <a href="https://medium.com/@NathOnSecurity/bug-bounties-and-mental-health-40662b2e497b" target="_blank">check it out here</a>.
</div>

# Advice
From my experience of getting paid bug hunting over past 12 months I have come up with the following advice that I wish I had known getting into this.

**Build a pipeline** - Bug hunting has its ups and downs, I have had amazing months more than doubling my targets, and I have had months where I have found no bugs. Being able to handle these highs and lows successfully is important to not burnout (or become too full of yourself). One way to manage this is to build a pipeline of submitted bugs, and further areas to investigate, across multiple programs and platforms. This will help even out the payment peaks and troughs and give you a wealth of leads to look into when bug hunting is not going so well.

**Record everything** - Collecting data on the work I do, and how I approach it has been key to me developing my approach. Other than target notes I try to keep accurate records, what programs pay well and quickly, what programs have I've had bad experiences with, what bugs I enjoy hunting for and what time of day I'm most productive. All this information helps plan how to spend my valuable time.

**Minimise your losses** - One major complaint about bug hunting in general is submitting issues which get marked as duplicates of previously submitted reports, resulting in no bounty payments. In general bug hunting, avoiding duplicates is critical for your bottom line and sanity. In my experience reports are most likely to be duplicates on lower tier, easy to identify issues, such as Cross Site Scripting, or on programs with excessively long average time to resolution (120 days+).

**Maximise your successes** - When reporting bugs, be clear and concise and include step by step instructions on how to reproduce the bug that has been found. It can be very time consuming and frustrating to go back and forth with the triage and customer bug bounty teams to confirm bugs that were reported with unclear impact, risk or steps to reproduce. If reporting a complex bug I will often include a video demonstration of the bug and steps to reproduce.

Well written reports, clear Proof of Concepts (PoCs) and video demonstrations will sometimes even result in higher bounty payouts or bonus awards from the customer, as they can understand and action your reports quickly and accurately.

**Plan your finances** - Going into any job you would evaluate the salary and the commitment required on your part, do the same for this. Make sure it is viable and that you have a plan in place in case you can't meet your financial targets. Ideally you should only work with programs that you have some experience of the payout scales and payment times so as to be able to forecast relatively accurately.

For tax calculations and filings I would definitely recommend procuring the services of a professional accountant who is familiar with your local tax laws and regulations. The tax system in the UK is not the most complicated, but it's more hassle than it is worth for me to try and get this right on my own. A good accountant, at least in the UK, should be able to save you more money than they cost in a very short period of time.

# Closing Thoughts
Personally making the jump to full-time bug hunting has been the best choice for me at this stage in my life. It's very easy for me to say that bug hunting is great and I highly recommend it, but that comes with some significant caveats. I am in a very privileged position (social, experiential, financial) which makes bug hunting a very low risk venture for me. Other people will have differing personal circumstances, some that may work well with bug hunting, and others that may not work so well.

For anyone getting started in security, I would recommend bug hunting as a great way to learn. You can get exposure to a wide range of systems and environments, work with some of the best security teams in the world and possibly earn some money on the side. However, without a solid grounding in security operations or penetration testing, earning a living wage only bug hunting *could* be a difficult task. For anyone with a few years hands on security experience bug hunting full-time is definitely an option. It should not be seen as a Get Rich Quick&trade; or easy option though (yes both of these are possible in certain circumstances), more likely than not it will take hard work and determination to keep hitting your targets.

If you are considering doing bug hunting full-time, have any questions, would like any further details or would like to share your own bug hunting experiences you can reach me on Twitter [@ajxchapman](https://twitter.com/ajxchapman).
