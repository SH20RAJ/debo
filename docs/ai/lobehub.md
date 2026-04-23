(Files content cropped to 300k characters, download full ingest to see more)
================================================
FILE: README.md
================================================
<div align="center"><a name="readme-top"></a>

[![][image-banner]][vercel-link]

# LobeHub

LobeHub is the ultimate space for work and life: <br/>
to find, build, and collaborate with agent teammates that grow with you.<br/>
We’re building the world’s largest human–agent co-evolving network.

**English** · [简体中文](./README.zh-CN.md) · [Official Site][official-site] · [Changelog][changelog] · [Documents][docs] · [Blog][blog] · [Feedback][github-issues-link]

<!-- SHIELD GROUP -->

[![][github-release-shield]][github-release-link]
[![][docker-release-shield]][docker-release-link]
[![][vercel-shield]][vercel-link]
[![][discord-shield]][discord-link]<br/>
[![][codecov-shield]][codecov-link]
[![][github-action-test-shield]][github-action-test-link]
[![][github-action-release-shield]][github-action-release-link]
[![][github-releasedate-shield]][github-releasedate-link]<br/>
[![][github-contributors-shield]][github-contributors-link]
[![][github-forks-shield]][github-forks-link]
[![][github-stars-shield]][github-stars-link]
[![][github-issues-shield]][github-issues-link]
[![][github-license-shield]][github-license-link]<br>
[![][sponsor-shield]][sponsor-link]

**Share LobeHub Repository**

[![][share-x-shield]][share-x-link]
[![][share-telegram-shield]][share-telegram-link]
[![][share-whatsapp-shield]][share-whatsapp-link]
[![][share-reddit-shield]][share-reddit-link]
[![][share-weibo-shield]][share-weibo-link]
[![][share-mastodon-shield]][share-mastodon-link]
[![][share-linkedin-shield]][share-linkedin-link]

<sup>Agent teammates that grow with you</sup>

[![][github-trending-shield]][github-trending-url]

[![](https://vercel.com/oss/program-badge.svg)](https://vercel.com/oss)

</div>

<details>
<summary><kbd>Table of contents</kbd></summary>

#### TOC

- [👋🏻 Getting Started & Join Our Community](#-getting-started--join-our-community)
- [✨ Features](#-features)
  - [Create: Agents as the Unit of Work](#create-agents-as-the-unit-of-work)
  - [Collaborate: Scale New Forms of Collaboration Networks](#collaborate-scale-new-forms-of-collaboration-networks)
  - [Evolve: Co-evolution of Humans and Agents](#evolve-co-evolution-of-humans-and-agents)
  - [MCP Plugin One-Click Installation](#mcp-plugin-one-click-installation)
  - [MCP Marketplace](#mcp-marketplace)
  - [Desktop App](#desktop-app)
  - [Smart Internet Search](#smart-internet-search)
  - [Chain of Thought](#chain-of-thought)
  - [Branching Conversations](#branching-conversations)
  - [Artifacts Support](#artifacts-support)
  - [File Upload /Knowledge Base](#file-upload-knowledge-base)
  - [Multi-Model Service Provider Support](#multi-model-service-provider-support)
  - [Local Large Language Model (LLM) Support](#local-large-language-model-llm-support)
  - [Model Visual Recognition](#model-visual-recognition)
  - [TTS & STT Voice Conversation](#tts--stt-voice-conversation)
  - [Text to Image Generation](#text-to-image-generation)
  - [Plugin System (Function Calling)](#plugin-system-function-calling)
  - [Agent Market (GPTs)](#agent-market-gpts)
  - [Support Local / Remote Database](#support-local--remote-database)
  - [Support Multi-User Management](#support-multi-user-management)
  - [Progressive Web App (PWA)](#progressive-web-app-pwa)
  - [Mobile Device Adaptation](#mobile-device-adaptation)
  - [Custom Themes](#custom-themes)
  - [`*` What's more](#-whats-more)
- [🛳 Self Hosting](#-self-hosting)
  - [`A` Deploying with Vercel, Zeabur , Sealos or Alibaba Cloud](#a-deploying-with-vercel-zeabur--sealos-or-alibaba-cloud)
  - [`B` Deploying with Docker](#b-deploying-with-docker)
  - [Environment Variable](#environment-variable)
- [📦 Ecosystem](#-ecosystem)
- [🧩 Plugins](#-plugins)
- [⌨️ Local Development](#️-local-development)
- [🤝 Contributing](#-contributing)
- [❤️ Sponsor](#️-sponsor)
- [🔗 More Products](#-more-products)

####

<br/>

</details>

<br/>

<https://github.com/user-attachments/assets/6710ad97-03d0-4175-bd75-adff9b55eca2>

## 👋🏻 Getting Started & Join Our Community

We are a group of e/acc design-engineers, hoping to provide modern design components and tools for AIGC.
By adopting the Bootstrapping approach, we aim to provide developers and users with a more open, transparent, and user-friendly product ecosystem.

Whether for users or professional developers, LobeHub will be your AI Agent playground. Please be aware that LobeHub is currently under active development, and feedback is welcome for any [issues][issues-link] encountered.

| [![](https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1065874&theme=light&t=1769347414733)](https://www.producthunt.com/products/lobehub?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-lobehub) | We are live on Product Hunt! We are thrilled to bring LobeHub to the world. If you believe in a future where humans and agents co-evolve, please support our journey. |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [![][discord-shield-badge]][discord-link]                                                                                                                                                                                                         | Join our Discord community! This is where you can connect with developers and other enthusiastic users of LobeHub.                                                    |

> \[!IMPORTANT]
>
> **Star Us**, You will receive all release notifications from GitHub without any delay \~ ⭐️

[![][image-star]][github-stars-link]

<details>
  <summary><kbd>Star History</kbd></summary>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=lobehub%2Flobehub&theme=dark&type=Date">
    <img width="100%" src="https://api.star-history.com/svg?repos=lobehub%2Flobehub&type=Date">
  </picture>
</details>

## ✨ Features

Today’s agents are one-off, task-driven tools. They lack context, live in isolation, and require manual hand-offs between different windows and models. While some maintain memory, it is often global, shallow, and impersonal. In this mode, users are forced to toggle between fragmented conversations, making it difficult to form structured productivity.

**LobeHub changes everything.**

LobeHub is a work-and-lifestyle space to find, build, and collaborate with agent teammates that grow with you. In LobeHub, we treat **Agents as the unit of work**, providing an infrastructure where humans and agents co-evolve.

![](https://hub-apac-1.lobeobjects.space/blog/assets/2204cde2228fb3f583f3f2c090bc49fb.webp)

### Create: Agents as the Unit of Work

Building a personalized AI team starts with the **Agent Builder**. You can describe what you need once, and the agent setup starts right away, applying auto-configurations so you can use it instantly.

- **Unified Intelligence**: Seamlessly access any model and any modality—all under your control.
- **10,000+ Skills**: Connect your agents to the skills you use every day with a library of over 10,000 tools and MCP-compatible plugins.

[![][back-to-top]](#readme-top)

<div align="right">

[![][back-to-top]](#readme-top)

</div>

![](https://hub-apac-1.lobeobjects.space/blog/assets/771ff3d30b9ef93e65e55021cc43d356.webp)

### Collaborate: Scale New Forms of Collaboration Networks

LobeHub introduces **Agent Groups**, allowing you to work with agents like real teammates. The system assembles the right agents for the task, enabling parallel collaboration and iterative improvement.

- **Pages**: Write and refine content with multiple agents in one place with a shared context.
- **Schedule**: Schedule runs and let agents do the work at the right time, even while you are away.
- **Project**: Organize work by project to keep everything structured and easy to track.
- **Workspace**: A shared space for teams to collaborate with agents, ensuring clear ownership and visibility across the organization.

[![][back-to-top]](#readme-top)

<div align="right">

[![][back-to-top]](#readme-top)

</div>

![](https://hub-apac-1.lobeobjects.space/blog/assets/fe98eae9fcb6acc47c8e1fb69bdb4b50.webp)

### Evolve: Co-evolution of Humans and Agents

The best AI is one that understands you deeply. LobeHub features **Personal Memory** that builds a clear understanding of your needs.

- **Continual Learning**: Your agents learn from how you work, adapting their behavior to act at the right moment.
- **White-Box Memory**: We believe in transparency. Your agents use structured, editable memory, giving you full control over what they remember.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

<details>
<summary>More Features</summary>

![][image-feat-mcp]

### MCP Plugin One-Click Installation

**Seamlessly Connect Your AI to the World**

Unlock the full potential of your AI by enabling smooth, secure, and dynamic interactions with external tools, data sources, and services. LobeHub's MCP (Model Context Protocol) plugin system breaks down the barriers between your AI and the digital ecosystem, allowing for unprecedented connectivity and functionality.

Transform your conversations into powerful workflows by connecting to databases, APIs, file systems, and more. Experience the freedom of AI that truly understands and interacts with your world.

[![][back-to-top]](#readme-top)

![][image-feat-mcp-market]

### MCP Marketplace

**Discover, Connect, Extend**

Browse a growing library of MCP plugins to expand your AI's capabilities and streamline your workflows effortlessly. Visit [lobehub.com/mcp](https://lobehub.com/mcp) to explore the MCP Marketplace, which offers a curated collection of integrations that enhance your AI's ability to work with various tools and services.

From productivity tools to development environments, discover new ways to extend your AI's reach and effectiveness. Connect with the community and find the perfect plugins for your specific needs.

[![][back-to-top]](#readme-top)

![][image-feat-desktop]

### Desktop App

**Peak Performance, Zero Distractions**

Get the full LobeHub experience without browser limitations—comprehensive, focused, and always ready to go. Our desktop application provides a dedicated environment for your AI interactions, ensuring optimal performance and minimal distractions.

Experience faster response times, better resource management, and a more stable connection to your AI assistant. The desktop app is designed for users who demand the best performance from their AI tools.

[![][back-to-top]](#readme-top)

![][image-feat-web-search]

### Smart Internet Search

**Online Knowledge On Demand**

With real-time internet access, your AI keeps up with the world—news, data, trends, and more. Stay informed and get the most current information available, enabling your AI to provide accurate and up-to-date responses.

Access live information, verify facts, and explore current events without leaving your conversation. Your AI becomes a gateway to the world's knowledge, always current and comprehensive.

[![][back-to-top]](#readme-top)

[![][image-feat-cot]][docs-feat-cot]

### [Chain of Thought][docs-feat-cot]

Experience AI reasoning like never before. Watch as complex problems unfold step by step through our innovative Chain of Thought (CoT) visualization. This breakthrough feature provides unprecedented transparency into AI's decision-making process, allowing you to observe how conclusions are reached in real-time.

By breaking down complex reasoning into clear, logical steps, you can better understand and validate the AI's problem-solving approach. Whether you're debugging, learning, or simply curious about AI reasoning, CoT visualization transforms abstract thinking into an engaging, interactive experience.

[![][back-to-top]](#readme-top)

[![][image-feat-branch]][docs-feat-branch]

### [Branching Conversations][docs-feat-branch]

Introducing a more natural and flexible way to chat with AI. With Branch Conversations, your discussions can flow in multiple directions, just like human conversations do. Create new conversation branches from any message, giving you the freedom to explore different paths while preserving the original context.

Choose between two powerful modes:

- **Continuation Mode:** Seamlessly extend your current discussion while maintaining valuable context
- **Standalone Mode:** Start fresh with a new topic based on any previous message

This groundbreaking feature transforms linear conversations into dynamic, tree-like structures, enabling deeper exploration of ideas and more productive interactions.

[![][back-to-top]](#readme-top)

[![][image-feat-artifacts]][docs-feat-artifacts]

### [Artifacts Support][docs-feat-artifacts]

Experience the power of Claude Artifacts, now integrated into LobeHub. This revolutionary feature expands the boundaries of AI-human interaction, enabling real-time creation and visualization of diverse content formats.

Create and visualize with unprecedented flexibility:

- Generate and display dynamic SVG graphics
- Build and render interactive HTML pages in real-time
- Produce professional documents in multiple formats

[![][back-to-top]](#readme-top)

[![][image-feat-knowledgebase]][docs-feat-knowledgebase]

### [File Upload /Knowledge Base][docs-feat-knowledgebase]

LobeHub supports file upload and knowledge base functionality. You can upload various types of files including documents, images, audio, and video, as well as create knowledge bases, making it convenient for users to manage and search for files. Additionally, you can utilize files and knowledge base features during conversations, enabling a richer dialogue experience.

<https://github.com/user-attachments/assets/faa8cf67-e743-4590-8bf6-ebf6ccc34175>

> \[!TIP]
>
> Learn more on [📘 LobeHub Knowledge Base Launch — From Now On, Every Step Counts](https://lobehub.com/blog/knowledge-base)

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-privoder]][docs-feat-provider]

### [Multi-Model Service Provider Support][docs-feat-provider]

In the continuous development of LobeHub, we deeply understand the importance of diversity in model service providers for meeting the needs of the community when providing AI conversation services. Therefore, we have expanded our support to multiple model service providers, rather than being limited to a single one, in order to offer users a more diverse and rich selection of conversations.

In this way, LobeHub can more flexibly adapt to the needs of different users, while also providing developers with a wider range of choices.

#### Supported Model Service Providers

We have implemented support for the following model service providers:

<!-- PROVIDER LIST -->

<details><summary><kbd>See more providers (+-10)</kbd></summary>

</details>

> 📊 Total providers: [<kbd>**0**</kbd>](https://lobechat.com/discover/providers)

 <!-- PROVIDER LIST -->

At the same time, we are also planning to support more model service providers. If you would like LobeHub to support your favorite service provider, feel free to join our [💬 community discussion](https://github.com/lobehub/lobehub/discussions/1284).

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-local]][docs-feat-local]

### [Local Large Language Model (LLM) Support][docs-feat-local]

To meet the specific needs of users, LobeHub also supports the use of local models based on [Ollama](https://ollama.ai), allowing users to flexibly use their own or third-party models.

> \[!TIP]
>
> Learn more about [📘 Using Ollama in LobeHub][docs-usage-ollama] by checking it out.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-vision]][docs-feat-vision]

### [Model Visual Recognition][docs-feat-vision]

LobeHub now supports OpenAI's latest [`gpt-4-vision`](https://platform.openai.com/docs/guides/vision) model with visual recognition capabilities,
a multimodal intelligence that can perceive visuals. Users can easily upload or drag and drop images into the dialogue box,
and the agent will be able to recognize the content of the images and engage in intelligent conversation based on this,
creating smarter and more diversified chat scenarios.

This feature opens up new interactive methods, allowing communication to transcend text and include a wealth of visual elements.
Whether it's sharing images in daily use or interpreting images within specific industries, the agent provides an outstanding conversational experience.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-tts]][docs-feat-tts]

### [TTS & STT Voice Conversation][docs-feat-tts]

LobeHub supports Text-to-Speech (TTS) and Speech-to-Text (STT) technologies, enabling our application to convert text messages into clear voice outputs,
allowing users to interact with our conversational agent as if they were talking to a real person. Users can choose from a variety of voices to pair with the agent.

Moreover, TTS offers an excellent solution for those who prefer auditory learning or desire to receive information while busy.
In LobeHub, we have meticulously selected a range of high-quality voice options (OpenAI Audio, Microsoft Edge Speech) to meet the needs of users from different regions and cultural backgrounds.
Users can choose the voice that suits their personal preferences or specific scenarios, resulting in a personalized communication experience.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-t2i]][docs-feat-t2i]

### [Text to Image Generation][docs-feat-t2i]

With support for the latest text-to-image generation technology, LobeHub now allows users to invoke image creation tools directly within conversations with the agent. By leveraging the capabilities of AI tools such as [`DALL-E 3`](https://openai.com/dall-e-3), [`MidJourney`](https://www.midjourney.com/), and [`Pollinations`](https://pollinations.ai/), the agents are now equipped to transform your ideas into images.

This enables a more private and immersive creative process, allowing for the seamless integration of visual storytelling into your personal dialogue with the agent.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-plugin]][docs-feat-plugin]

### [Plugin System (Function Calling)][docs-feat-plugin]

The plugin ecosystem of LobeHub is an important extension of its core functionality, greatly enhancing the practicality and flexibility of the LobeHub assistant.

<video controls src="https://github.com/lobehub/lobehub/assets/28616219/f29475a3-f346-4196-a435-41a6373ab9e2" muted="false"></video>

By utilizing plugins, LobeHub assistants can obtain and process real-time information, such as searching for web information and providing users with instant and relevant news.

In addition, these plugins are not limited to news aggregation, but can also extend to other practical functions, such as quickly searching documents, generating images, obtaining data from various platforms like Bilibili, Steam, and interacting with various third-party services.

> \[!TIP]
>
> Learn more about [📘 Plugin Usage][docs-usage-plugin] by checking it out.

<!-- PLUGIN LIST -->

| Recent Submits                                                                                                             | Description                                                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| [Shopping tools](https://lobechat.com/discover/plugin/ShoppingTools)<br/><sup>By **shoppingtools** on **2026-01-12**</sup> | Search for products on eBay & AliExpress, find eBay events & coupons. Get prompt examples.<br/>`shopping` `e-bay` `ali-express` `coupons`       |
| [SEO Assistant](https://lobechat.com/discover/plugin/seo_assistant)<br/><sup>By **webfx** on **2026-01-12**</sup>          | The SEO Assistant can generate search engine keyword information in order to aid the creation of content.<br/>`seo` `keyword`                   |
| [Video Captions](https://lobechat.com/discover/plugin/VideoCaptions)<br/><sup>By **maila** on **2025-12-13**</sup>         | Convert Youtube links into transcribed text, enable asking questions, create chapters, and summarize its content.<br/>`video-to-text` `youtube` |
| [WeatherGPT](https://lobechat.com/discover/plugin/WeatherGPT)<br/><sup>By **steven-tey** on **2025-12-13**</sup>           | Get current weather information for a specific location.<br/>`weather`                                                                          |

> 📊 Total plugins: [<kbd>**40**</kbd>](https://lobechat.com/discover/plugins)

 <!-- PLUGIN LIST -->

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-agent]][docs-feat-agent]

### [Agent Market (GPTs)][docs-feat-agent]

In LobeHub Agent Marketplace, creators can discover a vibrant and innovative community that brings together a multitude of well-designed agents,
which not only play an important role in work scenarios but also offer great convenience in learning processes.
Our marketplace is not just a showcase platform but also a collaborative space. Here, everyone can contribute their wisdom and share the agents they have developed.

> \[!TIP]
>
> By [🤖/🏪 Submit Agents][submit-agents-link], you can easily submit your agent creations to our platform.
> Importantly, LobeHub has established a sophisticated automated internationalization (i18n) workflow,
> capable of seamlessly translating your agent into multiple language versions.
> This means that no matter what language your users speak, they can experience your agent without barriers.

> \[!IMPORTANT]
>
> We welcome all users to join this growing ecosystem and participate in the iteration and optimization of agents.
> Together, we can create more interesting, practical, and innovative agents, further enriching the diversity and practicality of the agent offerings.

<!-- AGENT LIST -->

| Recent Submits                                                                                                                                                                 | Description                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Turtle Soup Host](https://lobechat.com/discover/assistant/lateral-thinking-puzzle)<br/><sup>By **[CSY2022](https://github.com/CSY2022)** on **2025-06-19**</sup>              | A turtle soup host needs to provide the scenario, the complete story (truth of the event), and the key point (the condition for guessing correctly).<br/>`turtle-soup` `reasoning` `interaction` `puzzle` `role-playing` |
| [Academic Writing Assistant](https://lobechat.com/discover/assistant/academic-writing-assistant)<br/><sup>By **[swarfte](https://github.com/swarfte)** on **2025-06-17**</sup> | Expert in academic research paper writing and formal documentation<br/>`academic-writing` `research` `formal-style`                                                                                                      |
| [Gourmet Reviewer🍟](https://lobechat.com/discover/assistant/food-reviewer)<br/><sup>By **[renhai-lab](https://github.com/renhai-lab)** on **2025-06-17**</sup>                | Food critique expert<br/>`gourmet` `review` `writing`                                                                                                                                                                    |
| [Minecraft Senior Developer](https://lobechat.com/discover/assistant/java-development)<br/><sup>By **[iamyuuk](https://github.com/iamyuuk)** on **2025-06-17**</sup>           | Expert in advanced Java development and Minecraft mod and server plugin development<br/>`development` `programming` `minecraft` `java`                                                                                   |

> 📊 Total agents: [<kbd>**505**</kbd> ](https://lobechat.com/discover/assistants)

 <!-- AGENT LIST -->

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-database]][docs-feat-database]

### [Support Local / Remote Database][docs-feat-database]

LobeHub supports the use of both server-side and local databases. Depending on your needs, you can choose the appropriate deployment solution:

- **Local database**: suitable for users who want more control over their data and privacy protection. LobeHub uses CRDT (Conflict-Free Replicated Data Type) technology to achieve multi-device synchronization. This is an experimental feature aimed at providing a seamless data synchronization experience.
- **Server-side database**: suitable for users who want a more convenient user experience. LobeHub supports PostgreSQL as a server-side database. For detailed documentation on how to configure the server-side database, please visit [Configure Server-side Database](https://lobehub.com/docs/self-hosting/advanced/server-database).

Regardless of which database you choose, LobeHub can provide you with an excellent user experience.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-auth]][docs-feat-auth]

### [Support Multi-User Management][docs-feat-auth]

LobeHub supports multi-user management and provides flexible user authentication solutions:

- **Better Auth**: LobeHub integrates `Better Auth`, a modern and flexible authentication library that supports multiple authentication methods, including OAuth, email login, credential login, magic links, and more. With `Better Auth`, you can easily implement user registration, login, session management, social login, multi-factor authentication (MFA), and other functions to ensure the security and privacy of user data.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-pwa]][docs-feat-pwa]

### [Progressive Web App (PWA)][docs-feat-pwa]

We deeply understand the importance of providing a seamless experience for users in today's multi-device environment.
Therefore, we have adopted Progressive Web Application ([PWA](https://support.google.com/chrome/answer/9658361)) technology,
a modern web technology that elevates web applications to an experience close to that of native apps.

Through PWA, LobeHub can offer a highly optimized user experience on both desktop and mobile devices while maintaining high-performance characteristics.
Visually and in terms of feel, we have also meticulously designed the interface to ensure it is indistinguishable from native apps,
providing smooth animations, responsive layouts, and adapting to different device screen resolutions.

> \[!NOTE]
>
> If you are unfamiliar with the installation process of PWA, you can add LobeHub as your desktop application (also applicable to mobile devices) by following these steps:
>
> - Launch the Chrome or Edge browser on your computer.
> - Visit the LobeHub webpage.
> - In the upper right corner of the address bar, click on the <kbd>Install</kbd> icon.
> - Follow the instructions on the screen to complete the PWA Installation.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-mobile]][docs-feat-mobile]

### [Mobile Device Adaptation][docs-feat-mobile]

We have carried out a series of optimization designs for mobile devices to enhance the user's mobile experience. Currently, we are iterating on the mobile user experience to achieve smoother and more intuitive interactions. If you have any suggestions or ideas, we welcome you to provide feedback through GitHub Issues or Pull Requests.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-theme]][docs-feat-theme]

### [Custom Themes][docs-feat-theme]

As a design-engineering-oriented application, LobeHub places great emphasis on users' personalized experiences,
hence introducing flexible and diverse theme modes, including a light mode for daytime and a dark mode for nighttime.
Beyond switching theme modes, a range of color customization options allow users to adjust the application's theme colors according to their preferences.
Whether it's a desire for a sober dark blue, a lively peach pink, or a professional gray-white, users can find their style of color choices in LobeHub.

> \[!TIP]
>
> The default configuration can intelligently recognize the user's system color mode and automatically switch themes to ensure a consistent visual experience with the operating system.
> For users who like to manually control details, LobeHub also offers intuitive setting options and a choice between chat bubble mode and document mode for conversation scenarios.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### `*` What's more

Beside these features, LobeHub also have much better basic technique underground:

- [x] 💨 **Quick Deployment**: Using the Vercel platform or docker image, you can deploy with just one click and complete the process within 1 minute without any complex configuration.
- [x] 🌐 **Custom Domain**: If users have their own domain, they can bind it to the platform for quick access to the dialogue agent from anywhere.
- [x] 🔒 **Privacy Protection**: All data is stored locally in the user's browser, ensuring user privacy.
- [x] 💎 **Exquisite UI Design**: With a carefully designed interface, it offers an elegant appearance and smooth interaction. It supports light and dark themes and is mobile-friendly. PWA support provides a more native-like experience.
- [x] 🗣️ **Smooth Conversation Experience**: Fluid responses ensure a smooth conversation experience. It fully supports Markdown rendering, including code highlighting, LaTex formulas, Mermaid flowcharts, and more.

</details>

> ✨ more features will be added when LobeHub evolve.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🛳 Self Hosting

LobeHub provides Self-Hosted Version with Vercel, Alibaba Cloud, and [Docker Image][docker-release-link]. This allows you to deploy your own chatbot within a few minutes without any prior knowledge.

> \[!TIP]
>
> Learn more about [📘 Build your own LobeHub][docs-self-hosting] by checking it out.

### `A` Deploying with Vercel, Zeabur , Sealos or Alibaba Cloud

"If you want to deploy this service yourself on Vercel, Zeabur or Alibaba Cloud, you can follow these steps:

- Prepare your [OpenAI API Key](https://platform.openai.com/account/api-keys).
- Click the button below to start deployment: Log in directly with your GitHub account, and remember to fill in the `OPENAI_API_KEY`(required) on the environment variable section.
- After deployment, you can start using it.
- Bind a custom domain (optional): The DNS of the domain assigned by Vercel is polluted in some areas; binding a custom domain can connect directly.

<div align="center">

|           Deploy with Vercel            |                     Deploy with Zeabur                      |                     Deploy with Sealos                      |                       Deploy with RepoCloud                       |                         Deploy with Alibaba Cloud                         |
| :-------------------------------------: | :---------------------------------------------------------: | :---------------------------------------------------------: | :---------------------------------------------------------------: | :-----------------------------------------------------------------------: |
| [![][deploy-button-image]][deploy-link] | [![][deploy-on-zeabur-button-image]][deploy-on-zeabur-link] | [![][deploy-on-sealos-button-image]][deploy-on-sealos-link] | [![][deploy-on-repocloud-button-image]][deploy-on-repocloud-link] | [![][deploy-on-alibaba-cloud-button-image]][deploy-on-alibaba-cloud-link] |

</div>

#### After Fork

After fork, only retain the upstream sync action and disable other actions in your repository on GitHub.

#### Keep Updated

If you have deployed your own project following the one-click deployment steps in the README, you might encounter constant prompts indicating "updates available." This is because Vercel defaults to creating a new project instead of forking this one, resulting in an inability to detect updates accurately.

> \[!TIP]
>
> We suggest you redeploy using the following steps, [📘 Auto Sync With Latest][docs-upstream-sync]

<br/>

### `B` Deploying with Docker

[![][docker-release-shield]][docker-release-link]
[![][docker-size-shield]][docker-size-link]
[![][docker-pulls-shield]][docker-pulls-link]

We provide a Docker image for deploying the LobeHub service on your own private device. Use the following command to start the LobeHub service:

1. create a folder to for storage files

```fish
$ mkdir lobehub-db && cd lobehub-db
```

2. init the LobeHub infrastructure

```fish
bash <(curl -fsSL https://lobe.li/setup.sh)
```

3. Start the LobeHub service

```fish
docker compose up -d
```

> \[!NOTE]
>
> For detailed instructions on deploying with Docker, please refer to the [📘 Docker Deployment Guide][docs-docker]

<br/>

### Environment Variable

This project provides some additional configuration items set with environment variables:

| Environment Variable | Required | Description                                                                                                                                                               | Example                                                                                                              |
| -------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `OPENAI_API_KEY`     | Yes      | This is the API key you apply on the OpenAI account page                                                                                                                  | `sk-xxxxxx...xxxxxx`                                                                                                 |
| `OPENAI_PROXY_URL`   | No       | If you manually configure the OpenAI interface proxy, you can use this configuration item to override the default OpenAI API request base URL                             | `https://api.chatanywhere.cn` or `https://aihubmix.com/v1` <br/>The default value is<br/>`https://api.openai.com/v1` |
| `OPENAI_MODEL_LIST`  | No       | Used to control the model list. Use `+` to add a model, `-` to hide a model, and `model_name=display_name` to customize the display name of a model, separated by commas. | `qwen-7b-chat,+glm-6b,-gpt-3.5-turbo`                                                                                |

> \[!NOTE]
>
> The complete list of environment variables can be found in the [📘 Environment Variables][docs-env-var]

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📦 Ecosystem

| NPM                               | Repository                              | Description                                                                                           | Version                                   |
| --------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| [@lobehub/ui][lobe-ui-link]       | [lobehub/lobe-ui][lobe-ui-github]       | Open-source UI component library dedicated to building AIGC web applications.                         | [![][lobe-ui-shield]][lobe-ui-link]       |
| [@lobehub/icons][lobe-icons-link] | [lobehub/lobe-icons][lobe-icons-github] | Popular AI / LLM Model Brand SVG Logo and Icon Collection.                                            | [![][lobe-icons-shield]][lobe-icons-link] |
| [@lobehub/tts][lobe-tts-link]     | [lobehub/lobe-tts][lobe-tts-github]     | High-quality & reliable TTS/STT React Hooks library                                                   | [![][lobe-tts-shield]][lobe-tts-link]     |
| [@lobehub/lint][lobe-lint-link]   | [lobehub/lobe-lint][lobe-lint-github]   | Configurations for ESlint, Stylelint, Commitlint, Prettier, Remark, and Semantic Release for LobeHub. | [![][lobe-lint-shield]][lobe-lint-link]   |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🧩 Plugins

Plugins provide a means to extend the [Function Calling][docs-function-call] capabilities of LobeHub. They can be used to introduce new function calls and even new ways to render message results. If you are interested in plugin development, please refer to our [📘 Plugin Development Guide][docs-plugin-dev] in the Wiki.

- [lobe-chat-plugins][lobe-chat-plugins]: This is the plugin index for LobeHub. It accesses index.json from this repository to display a list of available plugins for LobeHub to the user.
- [chat-plugin-template][chat-plugin-template]: This is the plugin template for LobeHub plugin development.
- [@lobehub/chat-plugin-sdk][chat-plugin-sdk]: The LobeHub Plugin SDK assists you in creating exceptional chat plugins for LobeHub.
- [@lobehub/chat-plugins-gateway][chat-plugins-gateway]: The LobeHub Plugins Gateway is a backend service that provides a gateway for LobeHub plugins. We deploy this service using Vercel. The primary API POST /api/v1/runner is deployed as an Edge Function.

> \[!NOTE]
>
> The plugin system is currently undergoing major development. You can learn more in the following issues:
>
> - [x] [**Plugin Phase 1**](https://github.com/lobehub/lobehub/issues/73): Implement separation of the plugin from the main body, split the plugin into an independent repository for maintenance, and realize dynamic loading of the plugin.
> - [x] [**Plugin Phase 2**](https://github.com/lobehub/lobehub/issues/97): The security and stability of the plugin's use, more accurately presenting abnormal states, the maintainability of the plugin architecture, and developer-friendly.
> - [x] [**Plugin Phase 3**](https://github.com/lobehub/lobehub/issues/149): Higher-level and more comprehensive customization capabilities, support for plugin authentication, and examples.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⌨️ Local Development

You can use GitHub Codespaces for online development:

[![][codespaces-shield]][codespaces-link]

Or clone it for local development:

```fish
$ git clone https://github.com/lobehub/lobehub.git
$ cd lobehub
$ pnpm install
$ pnpm dev          # Full-stack (Next.js + Vite SPA)
$ bun run dev:spa   # SPA frontend only (port 9876)
```

> **Debug Proxy**: After running `dev:spa`, the terminal prints a proxy URL like
> `https://app.lobehub.com/_dangerous_local_dev_proxy?debug-host=http%3A%2F%2Flocalhost%3A9876`.
> Open it to develop locally against the production backend with HMR.

If you would like to learn more details, please feel free to look at our [📘 Development Guide][docs-dev-guide].

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤝 Contributing

Contributions of all types are more than welcome; if you are interested in contributing code, feel free to check out our GitHub [Issues][github-issues-link] and [Projects][github-project-link] to get stuck in to show us what you're made of.

> \[!TIP]
>
> We are creating a technology-driven forum, fostering knowledge interaction and the exchange of ideas that may culminate in mutual inspiration and collaborative innovation.
>
> Help us make LobeHub better. Welcome to provide product design feedback, user experience discussions directly to us.
>
> **Principal Maintainers:** [@arvinxx](https://github.com/arvinxx) [@canisminor1990](https://github.com/canisminor1990)

[![][pr-welcome-shield]][pr-welcome-link]
[![][submit-agents-shield]][submit-agents-link]
[![][submit-plugin-shield]][submit-plugin-link]

<a href="https://github.com/lobehub/lobehub/graphs/contributors" target="_blank">
  <table>
    <tr>
      <th colspan="2">
        <br><img src="https://contrib.rocks/image?repo=lobehub/lobehub"><br><br>
      </th>
    </tr>
    <tr>
      <td>
        <picture>
          <source media="(prefers-color-scheme: dark)" srcset="https://next.ossinsight.io/widgets/official/compose-org-active-contributors/thumbnail.png?activity=active&period=past_28_days&owner_id=131470832&repo_ids=643445235&image_size=2x3&color_scheme=dark">
          <img src="https://next.ossinsight.io/widgets/official/compose-org-active-contributors/thumbnail.png?activity=active&period=past_28_days&owner_id=131470832&repo_ids=643445235&image_size=2x3&color_scheme=light">
        </picture>
      </td>
      <td rowspan="2">
        <picture>
          <source media="(prefers-color-scheme: dark)" srcset="https://next.ossinsight.io/widgets/official/compose-org-participants-growth/thumbnail.png?activity=active&period=past_28_days&owner_id=131470832&repo_ids=643445235&image_size=4x7&color_scheme=dark">
          <img src="https://next.ossinsight.io/widgets/official/compose-org-participants-growth/thumbnail.png?activity=active&period=past_28_days&owner_id=131470832&repo_ids=643445235&image_size=4x7&color_scheme=light">
        </picture>
      </td>
    </tr>
    <tr>
      <td>
        <picture>
          <source media="(prefers-color-scheme: dark)" srcset="https://next.ossinsight.io/widgets/official/compose-org-active-contributors/thumbnail.png?activity=new&period=past_28_days&owner_id=131470832&repo_ids=643445235&image_size=2x3&color_scheme=dark">
          <img src="https://next.ossinsight.io/widgets/official/compose-org-active-contributors/thumbnail.png?activity=new&period=past_28_days&owner_id=131470832&repo_ids=643445235&image_size=2x3&color_scheme=light">
        </picture>
      </td>
    </tr>
  </table>
</a>

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ❤️ Sponsor

Every bit counts and your one-time donation sparkles in our galaxy of support! You're a shooting star, making a swift and bright impact on our journey. Thank you for believing in us – your generosity guides us toward our mission, one brilliant flash at a time.

<a href="https://opencollective.com/lobehub" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/lobehub/.github/blob/main/static/sponsor-dark.png?raw=true">
    <img  src="https://github.com/lobehub/.github/blob/main/static/sponsor-light.png?raw=true">
  </picture>
</a>

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🔗 More Products

- **[🅰️ Lobe SD Theme][lobe-theme]:** Modern theme for Stable Diffusion WebUI, exquisite interface design, highly customizable UI, and efficiency-boosting features.
- **[⛵️ Lobe Midjourney WebUI][lobe-midjourney-webui]:** WebUI for Midjourney, leverages AI to quickly generate a wide array of rich and diverse images from text prompts, sparking creativity and enhancing conversations.
- **[🌏 Lobe i18n][lobe-i18n] :** Lobe i18n is an automation tool for the i18n (internationalization) translation process, powered by ChatGPT. It supports features such as automatic splitting of large files, incremental updates, and customization options for the OpenAI model, API proxy, and temperature.
- **[💌 Lobe Commit][lobe-commit]:** Lobe Commit is a CLI tool that leverages Langchain/ChatGPT to generate Gitmoji-based commit messages.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

---

<details><summary><h4>📝 License</h4></summary>

[![][fossa-license-shield]][fossa-license-link]

</details>

Copyright © 2026 [LobeHub][profile-link]. <br />
This project is [LobeHub Community License](./LICENSE) licensed.

<!-- LINK GROUP -->

[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square
[blog]: https://lobehub.com/blog
[changelog]: https://lobehub.com/changelog
[chat-plugin-sdk]: https://github.com/lobehub/chat-plugin-sdk
[chat-plugin-template]: https://github.com/lobehub/chat-plugin-template
[chat-plugins-gateway]: https://github.com/lobehub/chat-plugins-gateway
[codecov-link]: https://codecov.io/gh/lobehub/lobehub
[codecov-shield]: https://img.shields.io/codecov/c/github/lobehub/lobehub?labelColor=black&style=flat-square&logo=codecov&logoColor=white
[codespaces-link]: https://codespaces.new/lobehub/lobehub
[codespaces-shield]: https://github.com/codespaces/badge.svg
[deploy-button-image]: https://vercel.com/button
[deploy-link]: https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobehub&env=OPENAI_API_KEY&envDescription=Find%20your%20OpenAI%20API%20Key%20by%20click%20the%20right%20Learn%20More%20button.&envLink=https%3A%2F%2Fplatform.openai.com%2Faccount%2Fapi-keys&project-name=lobehub&repository-name=lobehub
[deploy-on-alibaba-cloud-button-image]: https://service-info-public.oss-cn-hangzhou.aliyuncs.com/computenest-en.svg
[deploy-on-alibaba-cloud-link]: https://computenest.console.aliyun.com/service/instance/create/default?type=user&ServiceName=LobeHub%E7%A4%BE%E5%8C%BA%E7%89%88
[deploy-on-repocloud-button-image]: https://d16t0pc4846x52.cloudfront.net/deploylobe.svg
[deploy-on-repocloud-link]: https://repocloud.io/details/?app_id=248
[deploy-on-sealos-button-image]: https://raw.githubusercontent.com/labring-actions/templates/main/Deploy-on-Sealos.svg
[deploy-on-sealos-link]: https://template.usw.sealos.io/deploy?templateName=lobehub-db
[deploy-on-zeabur-button-image]: https://zeabur.com/button.svg
[deploy-on-zeabur-link]: https://zeabur.com/templates/VZGGTI
[discord-link]: https://discord.gg/AYFPHvv2jT
[discord-shield]: https://img.shields.io/discord/1127171173982154893?color=5865F2&label=discord&labelColor=black&logo=discord&logoColor=white&style=flat-square
[discord-shield-badge]: https://img.shields.io/discord/1127171173982154893?color=5865F2&label=discord&labelColor=black&logo=discord&logoColor=white&style=for-the-badge
[docker-pulls-link]: https://hub.docker.com/r/lobehub/lobehub
[docker-pulls-shield]: https://img.shields.io/docker/pulls/lobehub/lobehub?color=45cc11&labelColor=black&style=flat-square&sort=semver
[docker-release-link]: https://hub.docker.com/r/lobehub/lobehub
[docker-release-shield]: https://img.shields.io/docker/v/lobehub/lobehub?color=369eff&label=docker&labelColor=black&logo=docker&logoColor=white&style=flat-square&sort=semver
[docker-size-link]: https://hub.docker.com/r/lobehub/lobehub
[docker-size-shield]: https://img.shields.io/docker/image-size/lobehub/lobehub?color=369eff&labelColor=black&style=flat-square&sort=semver
[docs]: https://lobehub.com/docs/usage/start
[docs-dev-guide]: https://lobehub.com/docs/development/start
[docs-docker]: https://lobehub.com/docs/self-hosting/server-database/docker-compose
[docs-env-var]: https://lobehub.com/docs/self-hosting/environment-variables
[docs-feat-agent]: https://lobehub.com/docs/usage/features/agent-market
[docs-feat-artifacts]: https://lobehub.com/docs/usage/features/artifacts
[docs-feat-auth]: https://lobehub.com/docs/usage/features/auth
[docs-feat-branch]: https://lobehub.com/docs/usage/features/branching-conversations
[docs-feat-cot]: https://lobehub.com/docs/usage/features/cot
[docs-feat-database]: https://lobehub.com/docs/usage/features/database
[docs-feat-knowledgebase]: https://lobehub.com/blog/knowledge-base
[docs-feat-local]: https://lobehub.com/docs/usage/features/local-llm
[docs-feat-mobile]: https://lobehub.com/docs/usage/features/mobile
[docs-feat-plugin]: https://lobehub.com/docs/usage/features/plugin-system
[docs-feat-provider]: https://lobehub.com/docs/usage/features/multi-ai-providers
[docs-feat-pwa]: https://lobehub.com/docs/usage/features/pwa
[docs-feat-t2i]: https://lobehub.com/docs/usage/features/text-to-image
[docs-feat-theme]: https://lobehub.com/docs/usage/features/theme
[docs-feat-tts]: https://lobehub.com/docs/usage/features/tts
[docs-feat-vision]: https://lobehub.com/docs/usage/features/vision
[docs-function-call]: https://lobehub.com/blog/openai-function-call
[docs-plugin-dev]: https://lobehub.com/docs/usage/plugins/development
[docs-self-hosting]: https://lobehub.com/docs/self-hosting/start
[docs-upstream-sync]: https://lobehub.com/docs/self-hosting/advanced/upstream-sync
[docs-usage-ollama]: https://lobehub.com/docs/usage/providers/ollama
[docs-usage-plugin]: https://lobehub.com/docs/usage/plugins/basic
[fossa-license-link]: https://app.fossa.com/projects/git%2Bgithub.com%2Flobehub%2Flobehub
[fossa-license-shield]: https://app.fossa.com/api/projects/git%2Bgithub.com%2Flobehub%2Flobehub.svg?type=large
[github-action-release-link]: https://github.com/actions/workflows/lobehub/lobehub/release.yml
[github-action-release-shield]: https://img.shields.io/github/actions/workflow/status/lobehub/lobehub/release.yml?label=release&labelColor=black&logo=githubactions&logoColor=white&style=flat-square
[github-action-test-link]: https://github.com/actions/workflows/lobehub/lobehub/test.yml
[github-action-test-shield]: https://img.shields.io/github/actions/workflow/status/lobehub/lobehub/test.yml?label=test&labelColor=black&logo=githubactions&logoColor=white&style=flat-square
[github-contributors-link]: https://github.com/lobehub/lobehub/graphs/contributors
[github-contributors-shield]: https://img.shields.io/github/contributors/lobehub/lobehub?color=c4f042&labelColor=black&style=flat-square
[github-forks-link]: https://github.com/lobehub/lobehub/network/members
[github-forks-shield]: https://img.shields.io/github/forks/lobehub/lobehub?color=8ae8ff&labelColor=black&style=flat-square
[github-issues-link]: https://github.com/lobehub/lobehub/issues
[github-issues-shield]: https://img.shields.io/github/issues/lobehub/lobehub?color=ff80eb&labelColor=black&style=flat-square
[github-license-link]: https://github.com/lobehub/lobehub/blob/main/LICENSE
[github-license-shield]: https://img.shields.io/badge/license-apache%202.0-white?labelColor=black&style=flat-square
[github-project-link]: https://github.com/lobehub/lobehub/projects
[github-release-link]: https://github.com/lobehub/lobehub/releases
[github-release-shield]: https://img.shields.io/github/v/release/lobehub/lobehub?color=369eff&labelColor=black&logo=github&style=flat-square
[github-releasedate-link]: https://github.com/lobehub/lobehub/releases
[github-releasedate-shield]: https://img.shields.io/github/release-date/lobehub/lobehub?labelColor=black&style=flat-square
[github-stars-link]: https://github.com/lobehub/lobehub/stargazers
[github-stars-shield]: https://img.shields.io/github/stars/lobehub/lobehub?color=ffcb47&labelColor=black&style=flat-square
[github-trending-shield]: https://trendshift.io/api/badge/repositories/2256
[github-trending-url]: https://trendshift.io/repositories/2256
[image-banner]: https://github.com/user-attachments/assets/0fe626a3-0ddc-4f67-b595-3c5b3f1701e0
[image-feat-agent]: https://github.com/user-attachments/assets/b3ab6e35-4fbc-468d-af10-e3e0c687350f
[image-feat-artifacts]: https://github.com/user-attachments/assets/7f95fad6-b210-4e6e-84a0-7f39e96f3a00
[image-feat-auth]: https://github.com/user-attachments/assets/80bb232e-19d1-4f97-98d6-e291f3585e6d
[image-feat-branch]: https://github.com/user-attachments/assets/92f72082-02bd-4835-9c54-b089aad7fd41
[image-feat-cot]: https://github.com/user-attachments/assets/f74f1139-d115-4e9c-8c43-040a53797a5e
[image-feat-database]: https://github.com/user-attachments/assets/f1697c8b-d1fb-4dac-ba05-153c6295d91d
[image-feat-desktop]: https://github.com/user-attachments/assets/a7bac8d3-ea96-4000-bb39-fadc9b610f96
[image-feat-knowledgebase]: https://github.com/user-attachments/assets/7da7a3b2-92fd-4630-9f4e-8560c74955ae
[image-feat-local]: https://github.com/user-attachments/assets/1239da50-d832-4632-a7ef-bd754c0f3850
[image-feat-mcp]: https://github.com/user-attachments/assets/1be85d36-3975-4413-931f-27e05e440995
[image-feat-mcp-market]: https://github.com/user-attachments/assets/bb114f9f-24c5-4000-a984-c10d187da5a0
[image-feat-mobile]: https://github.com/user-attachments/assets/32cf43c4-96bd-4a4c-bfb6-59acde6fe380
[image-feat-plugin]: https://github.com/user-attachments/assets/66a891ac-01b6-4e3f-b978-2eb07b489b1b
[image-feat-privoder]: https://github.com/user-attachments/assets/e553e407-42de-4919-977d-7dbfcf44a821
[image-feat-pwa]: https://github.com/user-attachments/assets/9647f70f-b71b-43b6-9564-7cdd12d1c24d
[image-feat-t2i]: https://github.com/user-attachments/assets/708274a7-2458-494b-a6ec-b73dfa1fa7c2
[image-feat-theme]: https://github.com/user-attachments/assets/b47c39f1-806f-492b-8fcb-b0fa973937c1
[image-feat-tts]: https://github.com/user-attachments/assets/50189597-2cc3-4002-b4c8-756a52ad5c0a
[image-feat-vision]: https://github.com/user-attachments/assets/18574a1f-46c2-4cbc-af2c-35a86e128a07
[image-feat-web-search]: https://github.com/user-attachments/assets/cfdc48ac-b5f8-4a00-acee-db8f2eba09ad
[image-star]: https://github.com/user-attachments/assets/3216e25b-186f-4a54-9cb4-2f124aec0471
[issues-link]: https://img.shields.io/github/issues/lobehub/lobehub.svg?style=flat
[lobe-chat-plugins]: https://github.com/lobehub/lobe-chat-plugins
[lobe-commit]: https://github.com/lobehub/lobe-commit/tree/master/packages/lobe-commit
[lobe-i18n]: https://github.com/lobehub/lobe-commit/tree/master/packages/lobe-i18n
[lobe-icons-github]: https://github.com/lobehub/lobe-icons
[lobe-icons-link]: https://www.npmjs.com/package/@lobehub/icons
[lobe-icons-shield]: https://img.shields.io/npm/v/@lobehub/icons?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[lobe-lint-github]: https://github.com/lobehub/lobe-lint
[lobe-lint-link]: https://www.npmjs.com/package/@lobehub/lint
[lobe-lint-shield]: https://img.shields.io/npm/v/@lobehub/lint?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[lobe-midjourney-webui]: https://github.com/lobehub/lobe-midjourney-webui
[lobe-theme]: https://github.com/lobehub/sd-webui-lobe-theme
[lobe-tts-github]: https://github.com/lobehub/lobe-tts
[lobe-tts-link]: https://www.npmjs.com/package/@lobehub/tts
[lobe-tts-shield]: https://img.shields.io/npm/v/@lobehub/tts?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[lobe-ui-github]: https://github.com/lobehub/lobe-ui
[lobe-ui-link]: https://www.npmjs.com/package/@lobehub/ui
[lobe-ui-shield]: https://img.shields.io/npm/v/@lobehub/ui?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[official-site]: https://lobehub.com
[pr-welcome-link]: https://github.com/lobehub/lobehub/pulls
[pr-welcome-shield]: https://img.shields.io/badge/🤯_pr_welcome-%E2%86%92-ffcb47?labelColor=black&style=for-the-badge
[profile-link]: https://github.com/lobehub
[share-linkedin-link]: https://linkedin.com/feed
[share-linkedin-shield]: https://img.shields.io/badge/-share%20on%20linkedin-black?labelColor=black&logo=linkedin&logoColor=white&style=flat-square
[share-mastodon-link]: https://mastodon.social/share?text=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20LobeHub%20-%20An%20open-source,%20extensible%20%28Function%20Calling%29,%20high-performance%20chatbot%20framework.%20It%20supports%20one-click%20free%20deployment%20of%20your%20private%20ChatGPT%2FLLM%20web%20application.%20https://github.com/lobehub/lobehub%20#chatbot%20#chatGPT%20#openAI
[share-mastodon-shield]: https://img.shields.io/badge/-share%20on%20mastodon-black?labelColor=black&logo=mastodon&logoColor=white&style=flat-square
[share-reddit-link]: https://www.reddit.com/submit?title=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20LobeHub%20-%20An%20open-source%2C%20extensible%20%28Function%20Calling%29%2C%20high-performance%20chatbot%20framework.%20It%20supports%20one-click%20free%20deployment%20of%20your%20private%20ChatGPT%2FLLM%20web%20application.%20%23chatbot%20%23chatGPT%20%23openAI&url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobehub
[share-reddit-shield]: https://img.shields.io/badge/-share%20on%20reddit-black?labelColor=black&logo=reddit&logoColor=white&style=flat-square
[share-telegram-link]: https://t.me/share/url"?text=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20LobeHub%20-%20An%20open-source%2C%20extensible%20%28Function%20Calling%29%2C%20high-performance%20chatbot%20framework.%20It%20supports%20one-click%20free%20deployment%20of%20your%20private%20ChatGPT%2FLLM%20web%20application.%20%23chatbot%20%23chatGPT%20%23openAI&url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobehub
[share-telegram-shield]: https://img.shields.io/badge/-share%20on%20telegram-black?labelColor=black&logo=telegram&logoColor=white&style=flat-square
[share-weibo-link]: http://service.weibo.com/share/share.php?sharesource=weibo&title=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20LobeHub%20-%20An%20open-source%2C%20extensible%20%28Function%20Calling%29%2C%20high-performance%20chatbot%20framework.%20It%20supports%20one-click%20free%20deployment%20of%20your%20private%20ChatGPT%2FLLM%20web%20application.%20%23chatbot%20%23chatGPT%20%23openAI&url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobehub
[share-weibo-shield]: https://img.shields.io/badge/-share%20on%20weibo-black?labelColor=black&logo=sinaweibo&logoColor=white&style=flat-square
[share-whatsapp-link]: https://api.whatsapp.com/send?text=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20LobeHub%20-%20An%20open-source%2C%20extensible%20%28Function%20Calling%29%2C%20high-performance%20chatbot%20framework.%20It%20supports%20one-click%20free%20deployment%20of%20your%20private%20ChatGPT%2FLLM%20web%20application.%20https%3A%2F%2Fgithub.com%2Flobehub%2Flobehub%20%23chatbot%20%23chatGPT%20%23openAI
[share-whatsapp-shield]: https://img.shields.io/badge/-share%20on%20whatsapp-black?labelColor=black&logo=whatsapp&logoColor=white&style=flat-square
[share-x-link]: https://x.com/intent/tweet?hashtags=chatbot%2CchatGPT%2CopenAI&text=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20LobeHub%20-%20An%20open-source%2C%20extensible%20%28Function%20Calling%29%2C%20high-performance%20chatbot%20framework.%20It%20supports%20one-click%20free%20deployment%20of%20your%20private%20ChatGPT%2FLLM%20web%20application.&url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobehub
[share-x-shield]: https://img.shields.io/badge/-share%20on%20x-black?labelColor=black&logo=x&logoColor=white&style=flat-square
[sponsor-link]: https://opencollective.com/lobehub 'Become ❤️ LobeHub Sponsor'
[sponsor-shield]: https://img.shields.io/badge/-Sponsor%20LobeHub-f04f88?logo=opencollective&logoColor=white&style=flat-square
[submit-agents-link]: https://github.com/lobehub/lobe-chat-agents
[submit-agents-shield]: https://img.shields.io/badge/🤖/🏪_submit_agent-%E2%86%92-c4f042?labelColor=black&style=for-the-badge
[submit-plugin-link]: https://github.com/lobehub/lobe-chat-plugins
[submit-plugin-shield]: https://img.shields.io/badge/🧩/🏪_submit_plugin-%E2%86%92-95f3d9?labelColor=black&style=for-the-badge
[vercel-link]: https://app.lobehub.com
[vercel-shield]: https://img.shields.io/badge/vercel-online-55b467?labelColor=black&logo=vercel&style=flat-square



================================================
FILE: README.zh-CN.md
================================================
<div align="center"><a name="readme-top"></a>

[![][image-banner]][vercel-link]

# LobeHub

LobeHub 是一个工作与生活空间，用于发现、构建并与会随着您一起成长的 Agent 队友协作。<br/>
在 LobeHub 中，我们将 **Agent 视为工作单元**，提供一个让人类与 Agent 共同进化的基础设施。

[English](./README.md) · **简体中文** · [官网][official-site] · [更新日志][changelog] · [文档][docs] · [博客][blog] · [反馈问题][github-issues-link]

<!-- SHIELD GROUP -->

[![][github-release-shield]][github-release-link]
[![][docker-release-shield]][docker-release-link]
[![][vercel-shield]][vercel-link]
[![][discord-shield]][discord-link]<br/>
[![][codecov-shield]][codecov-link]
[![][github-action-test-shield]][github-action-test-link]
[![][github-action-release-shield]][github-action-release-link]
[![][github-releasedate-shield]][github-releasedate-link]<br/>
[![][github-contributors-shield]][github-contributors-link]
[![][github-forks-shield]][github-forks-link]
[![][github-stars-shield]][github-stars-link]
[![][github-issues-shield]][github-issues-link]
[![][github-license-shield]][github-license-link]<br>
[![][sponsor-shield]][sponsor-link]

**分享 LobeHub 给你的好友**

[![][share-x-shield]][share-x-link]
[![][share-telegram-shield]][share-telegram-link]
[![][share-whatsapp-shield]][share-whatsapp-link]
[![][share-reddit-shield]][share-reddit-link]
[![][share-weibo-shield]][share-weibo-link]
[![][share-mastodon-shield]][share-mastodon-link]

<sup>Agent teammates that grow with you</sup>

[![][github-trending-shield]][github-trending-url]
[![][github-hello-shield]][github-hello-url]

</div>

<details>
<summary><kbd>目录树</kbd></summary>

#### TOC

- [👋🏻 开始使用 & 交流](#-开始使用--交流)
- [✨ 特性一览](#-特性一览)
  - [创建：以 Agent 为工作单元](#创建以-agent-为工作单元)
  - [协作：扩展新型协作网络](#协作扩展新型协作网络)
  - [进化：人类与 Agent 的共生进化](#进化人类与-agent-的共生进化)
  - [MCP](#mcp)
  - [发现、连接、扩展](#发现连接扩展)
  - [巅峰性能，零干扰](#巅峰性能零干扰)
  - [在线知识，按需获取](#在线知识按需获取)
  - [思维链 (CoT)](#思维链-cot)
  - [分支对话](#分支对话)
  - [支持白板 (Artifacts)](#支持白板-artifacts)
  - [文件上传 / 知识库](#文件上传--知识库)
  - [多模型服务商支持](#多模型服务商支持)
  - [支持本地大语言模型 (LLM)](#支持本地大语言模型-llm)
  - [模型视觉识别 (Model Visual)](#模型视觉识别-model-visual)
  - [TTS & STT 语音会话](#tts--stt-语音会话)
  - [Text to Image 文生图](#text-to-image-文生图)
  - [插件系统 (Tools Calling)](#插件系统-tools-calling)
  - [助手市场 (GPTs)](#助手市场-gpts)
  - [支持本地 / 远程数据库](#支持本地--远程数据库)
  - [支持多用户管理](#支持多用户管理)
  - [渐进式 Web 应用 (PWA)](#渐进式-web-应用-pwa)
  - [移动设备适配](#移动设备适配)
  - [自定义主题](#自定义主题)
  - [`*` 更多特性](#-更多特性)
- [🛳 开箱即用](#-开箱即用)
  - [`A` 使用 Vercel、Zeabur 、Sealos 或 阿里云计算巢 部署](#a-使用-vercelzeabur-sealos-或-阿里云计算巢-部署)
  - [`B` 使用 Docker 部署](#b-使用-docker-部署)
  - [环境变量](#环境变量)
  - [获取 OpenAI API Key](#获取-openai-api-key)
- [📦 生态系统](#-生态系统)
- [🧩 插件体系](#-插件体系)
- [⌨️ 本地开发](#️-本地开发)
- [🤝 参与贡献](#-参与贡献)
- [❤ 社区赞助](#-社区赞助)
- [🔗 更多工具](#-更多工具)

####

<br/>

</details>

<br/>

<https://github.com/user-attachments/assets/6710ad97-03d0-4175-bd75-adff9b55eca2>

## 👋🏻 开始使用 & 交流

我们是一群充满热情的设计工程师，希望为 AIGC 提供现代化的设计组件和工具，并以开源的方式分享。
同时通过 Bootstrapping 的方式，我们希望能够为开发者和用户提供一个更加开放、更加透明友好的产品生态。

不论普通用户与专业开发者，LobeHub 旨在成为所有人的 AI Agent 实验场。LobeHub 目前正在积极开发中，有任何需求或者问题，欢迎提交 [issues][issues-link]

| [![](https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1065874&theme=light&t=1769347414733)](https://www.producthunt.com/products/lobehub?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-lobehub) | 我们已在 Product Hunt 上线！我们很高兴将 LobeHub 推向世界。如果您相信人类与 Agent 共同进化的未来，请支持我们的旅程。 |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------- |
| [![][discord-shield-badge]][discord-link]                                                                                                                                                                                                         | 加入我们的 Discord 社区！这是你可以与开发者和其他 LobeHub 热衷用户交流的地方                                         |

> \[!IMPORTANT]
>
> **收藏项目**，你将从 GitHub 上无延迟地接收所有发布通知～⭐️

[![][image-star]][github-stars-link]

<details><summary><kbd>Star History</kbd></summary>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=lobehub%2Flobehub&theme=dark&type=Date">
    <img src="https://api.star-history.com/svg?repos=lobehub%2Flobehub&type=Date">
  </picture>
</details>

## ✨ 特性一览

现有的 Agent 大多是一次性、以任务为驱动的工具。它们缺乏上下文，孤立运行，并且需要在不同窗口和模型之间手动交接。即使有记忆，也往往是全局的、浅层的且缺乏个性。在这种模式下，用户被迫在分散的对话之间来回切换，难以形成结构化的生产流程。

**LobeHub 改变一切。**

LobeHub 是一个工作与生活空间，用于发现、构建并与会随着您一起成长的 Agent 队友协作。在 LobeHub 中，我们将 **Agent 视为工作单元**，提供一个让人类与 Agent 共同进化的基础设施。

![](https://hub-apac-1.lobeobjects.space/blog/assets/2204cde2228fb3f583f3f2c090bc49fb.webp)

### 创建：以 Agent 为工作单元

构建个性化 AI 团队从 **Agent Builder** 开始。您只需描述一次需求，Agent 配置即可立即启动，自动应用配置以便您立刻使用。

- **统一智能**：无缝访问任何模型与任何模态 —— 全部由您掌控。
- **1 万 + 技能**：通过超过 10,000 个工具和与 MCP 兼容的插件，将 Agent 连接到您每天使用的技能。

[![][back-to-top]](#readme-top)

<div align="right">

[![][back-to-top]](#readme-top)

</div>

![](https://hub-apac-1.lobeobjects.space/blog/assets/771ff3d30b9ef93e65e55021cc43d356.webp)

### 协作：扩展新型协作网络

LobeHub 引入了 **Agent Groups**，让您可以像对待真实队友一样与 Agent 协同工作。系统会为任务组装合适的 Agent，支持并行协作与迭代改进。

- **页面（Pages）**：在同一位置与多个 Agent 共同撰写和润色内容，共享上下文。
- **日程（Schedule）**：安排运行，让 Agent 在合适的时间完成工作，即使您不在也能继续执行。
- **项目（Project）**：按项目组织工作，保持一切结构化且易于跟踪。
- **工作区（Workspace）**：供团队与 Agent 协作的共享空间，确保明确的所有权和组织内的可见性。

[![][back-to-top]](#readme-top)

<div align="right">

[![][back-to-top]](#readme-top)

</div>

![](https://hub-apac-1.lobeobjects.space/blog/assets/fe98eae9fcb6acc47c8e1fb69bdb4b50.webp)

### 进化：人类与 Agent 的共生进化

最好的 AI 是能深入理解您的那一种。LobeHub 提供了构建清晰用户理解的 **个人记忆（Personal Memory）**。

- **持续学习**：您的 Agent 会从您的工作方式中学习，调整其行为以在恰当时刻采取行动。
- **白盒记忆**：我们相信透明性。您的 Agent 使用结构化、可编辑的记忆，让您完全掌控它们记住的内容。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

<details>
<summary>更多特性</summary>

[![](https://github.com/user-attachments/assets/1be85d36-3975-4413-931f-27e05e440995)](https://lobehub.com/mcp)

### MCP

通过启用与外部工具、数据源和服务的平滑、安全和动态交互，释放你的 AI 的全部潜力。基于 MCP（模型上下文协议）的插件系统打破了 AI 与数字生态系统之间的壁垒，实现了前所未有的连接性和功能性。

将对话转化为强大的工作流程，连接数据库、API、文件系统等。体验真正理解并与你的世界互动的 AI Agent。

[![][back-to-top]](#readme-top)

![][image-feat-mcp-market]

### 发现、连接、扩展

浏览不断增长的 MCP 插件库，轻松扩展你的 AI 能力并简化工作流程。访问 [lobehub.com/mcp](https://lobehub.com/mcp) 探索 MCP 市场，提供精选的集成集合，增强你的 AI 与各种工具和服务协作的能力。

从生产力工具到开发环境，发现扩展 AI 覆盖范围和效率的新方式。与社区连接，找到满足特定需求的完美插件。

[![][back-to-top]](#readme-top)

![][image-feat-desktop]

### 巅峰性能，零干扰

获得完整的 LobeHub 体验，摆脱浏览器限制 —— 轻量级、专注且随时就绪。我们的桌面应用程序为你的 AI 交互提供专用环境，确保最佳性能和最小干扰。

体验更快的响应时间、更好的资源管理和与 AI 助手的更稳定连接。桌面应用专为要求 AI 工具最佳性能的用户设计。

[![][back-to-top]](#readme-top)

![][image-feat-web-search]

### 在线知识，按需获取

通过实时联网访问，你的 AI 与世界保持同步 —— 新闻、数据、趋势等。保持信息更新，获取最新可用信息，使你的 AI 能够提供准确和最新的回复。

访问实时信息，验证事实，探索当前事件，无需离开对话。你的 AI 成为通向世界知识的门户，始终保持最新和全面。

[![][back-to-top]](#readme-top)

[![][image-feat-cot]][docs-feat-cot]

### [思维链 (CoT)][docs-feat-cot]

体验前所未有的 AI 推理过程。通过创新的思维链（CoT）可视化功能，您可以实时观察复杂问题是如何一步步被解析的。这项突破性的功能为 AI 的决策过程提供了前所未有的透明度，让您能够清晰地了解结论是如何得出的。

通过将复杂的推理过程分解为清晰的逻辑步骤，您可以更好地理解和验证 AI 的解题思路。无论您是在调试问题、学习知识，还是单纯对 AI 推理感兴趣，思维链可视化都能将抽象思维转化为一种引人入胜的互动体验。

[![][back-to-top]](#readme-top)

[![][image-feat-branch]][docs-feat-branch]

### [分支对话][docs-feat-branch]

为您带来更自然、更灵活的 AI 对话方式。通过分支对话功能，您的讨论可以像人类对话一样自然延伸。在任意消息处创建新的对话分支，让您在保留原有上下文的同时，自由探索不同的对话方向。

两种强大模式任您选择：

- **延续模式**：无缝延展当前讨论，保持宝贵的对话上下文
- **独立模式**：基于任意历史消息，开启全新话题探讨

这项突破性功能将线性对话转变为动态的树状结构，让您能够更深入地探索想法，实现更高效的互动体验。

[![][back-to-top]](#readme-top)

[![][image-feat-artifacts]][docs-feat-artifacts]

### [支持白板 (Artifacts)][docs-feat-artifacts]

体验集成于 LobeHub 的 Claude Artifacts 能力。这项革命性功能突破了 AI 人机交互的边界，让您能够实时创建和可视化各种格式的内容。

以前所未有的灵活度进行创作与可视化：

- 生成并展示动态 SVG 图形
- 实时构建与渲染交互式 HTML 页面
- 输出多种格式的专业文档

[![][back-to-top]](#readme-top)

[![][image-feat-knowledgebase]][docs-feat-knowledgebase]

### [文件上传 / 知识库][docs-feat-knowledgebase]

LobeHub 支持文件上传与知识库功能，你可以上传文件、图片、音频、视频等多种类型的文件，以及创建知识库，方便用户管理和查找文件。同时在对话中使用文件和知识库功能，实现更加丰富的对话体验。

<https://github.com/user-attachments/assets/faa8cf67-e743-4590-8bf6-ebf6ccc34175>

> \[!TIP]
>
> 查阅 [📘 LobeHub 知识库上线 —— 此刻起，跬步千里](https://lobehub.com/zh/blog/knowledge-base) 了解详情。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-privoder]][docs-feat-provider]

### [多模型服务商支持][docs-feat-provider]

在 LobeHub 的不断发展过程中，我们深刻理解到在提供 AI 会话服务时模型服务商的多样性对于满足社区需求的重要性。因此，我们不再局限于单一的模型服务商，而是拓展了对多种模型服务商的支持，以便为用户提供更为丰富和多样化的会话选择。

通过这种方式，LobeHub 能够更灵活地适应不同用户的需求，同时也为开发者提供了更为广泛的选择空间。

#### 已支持的模型服务商

我们已经实现了对以下模型服务商的支持：

<!-- PROVIDER LIST -->

<details><summary><kbd>See more providers (+-10)</kbd></summary>

</details>

> 📊 Total providers: [<kbd>**0**</kbd>](https://lobechat.com/discover/providers)

 <!-- PROVIDER LIST -->

同时，我们也在计划支持更多的模型服务商，以进一步丰富我们的服务商库。如果你希望让 LobeHub 支持你喜爱的服务商，欢迎加入我们的 [💬 社区讨论](https://github.com/lobehub/lobehub/discussions/6157)。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-local]][docs-feat-local]

### [支持本地大语言模型 (LLM)][docs-feat-local]

为了满足特定用户的需求，LobeHub 还基于 [Ollama](https://ollama.ai) 支持了本地模型的使用，让用户能够更灵活地使用自己的或第三方的模型。

> \[!TIP]
>
> 查阅 [📘 在 LobeHub 中使用 Ollama][docs-usage-ollama] 获得更多信息

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-vision]][docs-feat-vision]

### [模型视觉识别 (Model Visual)][docs-feat-vision]

LobeHub 已经支持 OpenAI 最新的 [`gpt-4-vision`](https://platform.openai.com/docs/guides/vision) 支持视觉识别的模型，这是一个具备视觉识别能力的多模态应用。
用户可以轻松上传图片或者拖拽图片到对话框中，助手将能够识别图片内容，并在此基础上进行智能对话，构建更智能、更多元化的聊天场景。

这一特性打开了新的互动方式，使得交流不再局限于文字，而是可以涵盖丰富的视觉元素。无论是日常使用中的图片分享，还是在特定行业内的图像解读，助手都能提供出色的对话体验。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-tts]][docs-feat-tts]

### [TTS & STT 语音会话][docs-feat-tts]

LobeHub 支持文字转语音（Text-to-Speech，TTS）和语音转文字（Speech-to-Text，STT）技术，这使得我们的应用能够将文本信息转化为清晰的语音输出，用户可以像与真人交谈一样与我们的对话助手进行交流。
用户可以从多种声音中选择，给助手搭配合适的音源。 同时，对于那些倾向于听觉学习或者想要在忙碌中获取信息的用户来说，TTS 提供了一个极佳的解决方案。

在 LobeHub 中，我们精心挑选了一系列高品质的声音选项 (OpenAI Audio, Microsoft Edge Speech)，以满足不同地域和文化背景用户的需求。用户可以根据个人喜好或者特定场景来选择合适的语音，从而获得个性化的交流体验。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-t2i]][docs-feat-t2i]

### [Text to Image 文生图][docs-feat-t2i]

支持最新的文本到图片生成技术，LobeHub 现在能够让用户在与助手对话中直接调用文生图工具进行创作。
通过利用 [`DALL-E 3`](https://openai.com/dall-e-3)、[`MidJourney`](https://www.midjourney.com/) 和 [`Pollinations`](https://pollinations.ai/) 等 AI 工具的能力， 助手们现在可以将你的想法转化为图像。
同时可以更私密和沉浸式地完成你的创作过程。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-plugin]][docs-feat-plugin]

### [插件系统 (Tools Calling)][docs-feat-plugin]

LobeHub 的插件生态系统是其核心功能的重要扩展，它极大地增强了 ChatGPT 的实用性和灵活性。

<video controls src="https://github.com/lobehub/lobehub/assets/28616219/f29475a3-f346-4196-a435-41a6373ab9e2" muted="false"></video>

通过利用插件，ChatGPT 能够实现实时信息的获取和处理，例如自动获取最新新闻头条，为用户提供即时且相关的资讯。

此外，这些插件不仅局限于新闻聚合，还可以扩展到其他实用的功能，如快速检索文档、生成图象、获取电商平台数据，以及其他各式各样的第三方服务。

> 通过文档了解更多 [📘 插件使用][docs-usage-plugin]

<!-- PLUGIN LIST -->

| 最近新增                                                                                                             | 描述                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| [购物工具](https://lobechat.com/discover/plugin/ShoppingTools)<br/><sup>By **shoppingtools** on **2026-01-12**</sup> | 在 eBay 和 AliExpress 上搜索产品，查找 eBay 活动和优惠券。获取快速示例。<br/>`购物` `e-bay` `ali-express` `优惠券` |
| [SEO 助手](https://lobechat.com/discover/plugin/seo_assistant)<br/><sup>By **webfx** on **2026-01-12**</sup>         | SEO 助手可以生成搜索引擎关键词信息，以帮助创建内容。<br/>`seo` `关键词`                                            |
| [视频字幕](https://lobechat.com/discover/plugin/VideoCaptions)<br/><sup>By **maila** on **2025-12-13**</sup>         | 将 Youtube 链接转换为转录文本，使其能够提问，创建章节，并总结其内容。<br/>`视频转文字` `you-tube`                  |
| [天气 GPT](https://lobechat.com/discover/plugin/WeatherGPT)<br/><sup>By **steven-tey** on **2025-12-13**</sup>       | 获取特定位置的当前天气信息。<br/>`天气`                                                                            |

> 📊 Total plugins: [<kbd>**40**</kbd>](https://lobechat.com/discover/plugins)

 <!-- PLUGIN LIST -->

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-agent]][docs-feat-agent]

### [助手市场 (GPTs)][docs-feat-agent]

在 LobeHub 的助手市场中，创作者们可以发现一个充满活力和创新的社区，它汇聚了众多精心设计的助手，这些助手不仅在工作场景中发挥着重要作用，也在学习过程中提供了极大的便利。
我们的市场不仅是一个展示平台，更是一个协作的空间。在这里，每个人都可以贡献自己的智慧，分享个人开发的助手。

> \[!TIP]
>
> 通过 [🤖/🏪 提交助手][submit-agents-link] ，你可以轻松地将你的助手作品提交到我们的平台。我们特别强调的是，LobeHub 建立了一套精密的自动化国际化（i18n）工作流程， 它的强大之处在于能够无缝地将你的助手转化为多种语言版本。
> 这意味着，不论你的用户使用何种语言，他们都能无障碍地体验到你的助手。

> \[!IMPORTANT]
>
> 我欢迎所有用户加入这个不断成长的生态系统，共同参与到助手的迭代与优化中来。共同创造出更多有趣、实用且具有创新性的助手，进一步丰富助手的多样性和实用性。

<!-- AGENT LIST -->

| 最近新增                                                                                                                                                         | 描述                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| [海龟汤主持人](https://lobechat.com/discover/assistant/lateral-thinking-puzzle)<br/><sup>By **[CSY2022](https://github.com/CSY2022)** on **2025-06-19**</sup>    | 一个海龟汤主持人，需要自己提供汤面，汤底与关键点（猜中的判定条件）。<br/>`海龟汤` `推理` `互动` `谜题` `角色扮演` |
| [学术写作助手](https://lobechat.com/discover/assistant/academic-writing-assistant)<br/><sup>By **[swarfte](https://github.com/swarfte)** on **2025-06-17**</sup> | 专业的学术研究论文写作和正式文档编写专家<br/>`学术写作` `研究` `正式风格`                                         |
| [美食评论员🍟](https://lobechat.com/discover/assistant/food-reviewer)<br/><sup>By **[renhai-lab](https://github.com/renhai-lab)** on **2025-06-17**</sup>        | 美食评价专家<br/>`美食` `评价` `写作`                                                                             |
| [Minecraft 资深开发者](https://lobechat.com/discover/assistant/java-development)<br/><sup>By **[iamyuuk](https://github.com/iamyuuk)** on **2025-06-17**</sup>   | 擅长高级 Java 开发及 Minecraft 开发<br/>`开发` `编程` `minecraft` `java`                                          |

> 📊 Total agents: [<kbd>**505**</kbd> ](https://lobechat.com/discover/assistants)

 <!-- AGENT LIST -->

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-database]][docs-feat-database]

### [支持本地 / 远程数据库][docs-feat-database]

LobeHub 支持同时使用服务端数据库和本地数据库。根据您的需求，您可以选择合适的部署方案：

- 本地数据库：适合希望对数据有更多掌控感和隐私保护的用户。LobeHub 采用了 CRDT (Conflict-Free Replicated Data Type) 技术，实现了多端同步功能。这是一项实验性功能，旨在提供无缝的数据同步体验。
- 服务端数据库：适合希望更便捷使用体验的用户。LobeHub 支持 PostgreSQL 作为服务端数据库。关于如何配置服务端数据库的详细文档，请前往 [配置服务端数据库](https://lobehub.com/zh/docs/self-hosting/advanced/server-database)。

无论您选择哪种数据库，LobeHub 都能为您提供卓越的用户体验。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-auth]][docs-feat-auth]

### [支持多用户管理][docs-feat-auth]

LobeHub 支持多用户管理，提供了灵活的用户认证方案：

- **Better Auth**：LobeHub 集成了 `Better Auth`，一个现代化且灵活的身份验证库，支持多种身份验证方式，包括 OAuth、邮件登录、凭证登录、魔法链接等。通过 `Better Auth`，您可以轻松实现用户的注册、登录、会话管理、社交登录、多因素认证 (MFA) 等功能，确保用户数据的安全性和隐私性。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-pwa]][docs-feat-pwa]

### [渐进式 Web 应用 (PWA)][docs-feat-pwa]

我们深知在当今多设备环境下为用户提供无缝体验的重要性。为此，我们采用了渐进式 Web 应用 [PWA](https://support.google.com/chrome/answer/9658361) 技术，
这是一种能够将网页应用提升至接近原生应用体验的现代 Web 技术。通过 PWA，LobeHub 能够在桌面和移动设备上提供高度优化的用户体验，同时保持轻量级和高性能的特点。
在视觉和感觉上，我们也经过精心设计，以确保它的界面与原生应用无差别，提供流畅的动画、响应式布局和适配不同设备的屏幕分辨率。

> \[!NOTE]
>
> 若您未熟悉 PWA 的安装过程，您可以按照以下步骤将 LobeHub 添加为您的桌面应用（也适用于移动设备）：
>
> - 在电脑上运行 Chrome 或 Edge 浏览器 .
> - 访问 LobeHub 网页 .
> - 在地址栏的右上角，单击 <kbd>安装</kbd> 图标 .

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-mobile]][docs-feat-mobile]

### [移动设备适配][docs-feat-mobile]

针对移动设备进行了一系列的优化设计，以提升用户的移动体验。目前，我们正在对移动端的用户体验进行版本迭代，以实现更加流畅和直观的交互。如果您有任何建议或想法，我们非常欢迎您通过 GitHub Issues 或者 Pull Requests 提供反馈。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-theme]][docs-feat-theme]

### [自定义主题][docs-feat-theme]

作为设计工程师出身，LobeHub 在界面设计上充分考虑用户的个性化体验，因此引入了灵活多变的主题模式，其中包括日间的亮色模式和夜间的深色模式。
除了主题模式的切换，还提供了一系列的颜色定制选项，允许用户根据自己的喜好来调整应用的主题色彩。无论是想要沉稳的深蓝，还是希望活泼的桃粉，或者是专业的灰白，用户都能够在 LobeHub 中找到匹配自己风格的颜色选择。

> \[!TIP]
>
> 默认配置能够智能地识别用户系统的颜色模式，自动进行主题切换，以确保应用界面与操作系统保持一致的视觉体验。对于喜欢手动调控细节的用户，LobeHub 同样提供了直观的设置选项，针对聊天场景也提供了对话气泡模式和文档模式的选择。

<div align="right">

<div align="right">

[![][back-to-top]](#readme-top)

</div>

</div>

### `*` 更多特性

除了上述功能特性以外，LobeHub 所具有的设计和技术能力将为你带来更多使用保障：

- [x] 💎 **精致 UI 设计**：经过精心设计的界面，具有优雅的外观和流畅的交互效果，支持亮暗色主题，适配移动端。支持 PWA，提供更加接近原生应用的体验。
- [x] 🗣️ **流畅的对话体验**：流式响应带来流畅的对话体验，并且支持完整的 Markdown 渲染，包括代码高亮、LaTex 公式、Mermaid 流程图等。
- [x] 💨 **快速部署**：使用 Vercel 平台或者我们的 Docker 镜像，只需点击一键部署按钮，即可在 1 分钟内完成部署，无需复杂的配置过程。
- [x] 🔒 **隐私安全**：所有数据保存在用户浏览器本地，保证用户的隐私安全。
- [x] 🌐 **自定义域名**：如果用户拥有自己的域名，可以将其绑定到平台上，方便在任何地方快速访问对话助手。

</details>

> ✨ 随着产品迭代持续更新，我们将会带来更多更多令人激动的功能！

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🛳 开箱即用

LobeHub 提供了 Vercel 的 自托管版本 和 [Docker 镜像][docker-release-link]，这使你可以在几分钟内构建自己的聊天机器人，无需任何基础知识。

> \[!TIP]
>
> 完整教程请查阅 [📘 构建属于自己的 LobeHub][docs-self-hosting]

### `A` 使用 Vercel、Zeabur 、Sealos 或 阿里云计算巢 部署

如果想在 Vercel 、 Zeabur 或 阿里云 上部署该服务，可以按照以下步骤进行操作：

- 准备好你的 [OpenAI API Key](https://platform.openai.com/account/api-keys) 。
- 点击下方按钮开始部署： 直接使用 GitHub 账号登录即可，记得在环境变量页填入 `OPENAI_API_KEY` （必填）；
- 部署完毕后，即可开始使用；
- 绑定自定义域名（可选）：Vercel 分配的域名 DNS 在某些区域被污染了，绑定自定义域名即可直连。目前 Zeabur 提供的域名还未被污染，大多数地区都可以直连。

<div align="center">

|            使用 Vercel 部署             |                      使用 Zeabur 部署                       |                      使用 Sealos 部署                       |                           使用阿里云计算巢部署                            |
| :-------------------------------------: | :---------------------------------------------------------: | :---------------------------------------------------------: | :-----------------------------------------------------------------------: |
| [![][deploy-button-image]][deploy-link] | [![][deploy-on-zeabur-button-image]][deploy-on-zeabur-link] | [![][deploy-on-sealos-button-image]][deploy-on-sealos-link] | [![][deploy-on-alibaba-cloud-button-image]][deploy-on-alibaba-cloud-link] |

</div>

#### Fork 之后

在 Fork 后，请只保留 "upstream sync" Action 并在你 fork 的 GitHub Repo 中禁用其他 Action。

#### 保持更新

如果你根据 README 中的一键部署步骤部署了自己的项目，你可能会发现总是被提示 "有可用更新"。这是因为 Vercel 默认为你创建新项目而非 fork 本项目，这将导致无法准确检测更新。

> \[!TIP]
>
> 我们建议按照 [📘 自动同步更新][docs-upstream-sync] 步骤重新部署。

<br/>

### `B` 使用 Docker 部署

[![][docker-release-shield]][docker-release-link]
[![][docker-size-shield]][docker-size-link]
[![][docker-pulls-shield]][docker-pulls-link]

我们提供了一个用于在您自己的私有设备上部署 LobeHub 服务的 Docker 镜像。请使用以下命令启动 LobeHub 服务：

1. 创建一个用于存储文件的文件夹

```fish
$ mkdir lobehub-db && cd lobehub-db
```

2. 启动一键脚本

```fish
bash <(curl -fsSL https://lobe.li/setup.sh) -l zh_CN
```

3. 启动 LobeHub

```fish
docker compose up -d
```

> \[!NOTE]
>
> 有关 Docker 部署的详细说明，详见 [📘 使用 Docker 部署][docs-docker]

<br/>

### 环境变量

本项目提供了一些额外的配置项，使用环境变量进行设置：

| 环境变量            | 类型 | 描述                                                                                                                          | 示例                                                                                                   |
| ------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `OPENAI_API_KEY`    | 必选 | 这是你在 OpenAI 账户页面申请的 API 密钥                                                                                       | `sk-xxxxxx...xxxxxx`                                                                                   |
| `OPENAI_PROXY_URL`  | 可选 | 如果你手动配置了 OpenAI 接口代理，可以使用此配置项来覆盖默认的 OpenAI API 请求基础 URL                                        | `https://api.chatanywhere.cn` 或 `https://aihubmix.com/v1`<br/>默认值:<br/>`https://api.openai.com/v1` |
| `OPENAI_MODEL_LIST` | 可选 | 用来控制模型列表，使用 `+` 增加一个模型，使用 `-` 来隐藏一个模型，使用 `模型名=展示名` 来自定义模型的展示名，用英文逗号隔开。 | `qwen-7b-chat,+glm-6b,-gpt-3.5-turbo`                                                                  |

> \[!NOTE]
>
> 完整环境变量可见 [📘 环境变量][docs-env-var]

<br/>

### 获取 OpenAI API Key

API Key 是使用 LobeHub 进行大语言模型会话的必要信息，本节以 OpenAI 模型服务商为例，简要介绍获取 API Key 的方式。

#### `A` 通过 OpenAI 官方渠道

- 注册一个 [OpenAI 账户](https://platform.openai.com/signup)，你需要使用国际手机号、非大陆邮箱进行注册；
- 注册完毕后，前往 [API Keys](https://platform.openai.com/api-keys) 页面，点击 `Create new secret key` 创建新的 API Key:

| 步骤 1：打开创建窗口                                                                                                                               | 步骤 2：创建 API Key                                                                                                                               | 步骤 3：获取 API Key                                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| <img src="https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/296253192-ff2193dd-f125-4e58-82e8-91bc376c0d68.png" height="200"/> | <img src="https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/296254170-803bacf0-4471-4171-ae79-0eab08d621d1.png" height="200"/> | <img src="https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/296255167-f2745f2b-f083-4ba8-bc78-9b558e0002de.png" height="200"/> |

- 将此 API Key 填写到 LobeHub 的 API Key 配置中，即可开始使用。

> \[!TIP]
>
> 账户注册后，一般有 5 美元的免费额度，但有效期只有三个月。
> 如果你希望长期使用你的 API Key，你需要完成支付的信用卡绑定。由于 OpenAI 只支持外币信用卡，因此你需要找到合适的支付渠道，此处不再详细展开。

<br/>

#### `B` 通过 OpenAI 第三方代理商

如果你发现注册 OpenAI 账户或者绑定外币信用卡比较麻烦，可以考虑借助一些知名的 OpenAI 第三方代理商来获取 API Key，这可以有效降低获取 OpenAI API Key 的门槛。但与此同时，一旦使用三方服务，你可能也需要承担潜在的风险，
请根据你自己的实际情况自行决策。以下是常见的第三方模型代理商列表，供你参考：

|                                                                                                                                                   | 服务商       | 特性说明                                                        | Proxy 代理地址            | 链接                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | --------------------------------------------------------------- | ------------------------- | ------------------------------- |
| <img src="https://github-production-user-asset-6210df.s3.amazonaws.com/17870709/296272721-c3ac0bf3-e433-4496-89c4-ebdc20689c17.jpg" width="48" /> | **AiHubMix** | 使用 OpenAI 企业接口，全站模型价格为官方 **86 折**（含 GPT-4 ） | `https://aihubmix.com/v1` | [获取](https://lobe.li/XHnZIUP) |

> \[!WARNING]
>
> **免责申明**: 在此推荐的 OpenAI API Key 由第三方代理商提供，所以我们不对 API Key 的 **有效性** 和 **安全性** 负责，请你自行承担购买和使用 API Key 的风险。

> \[!NOTE]
>
> 如果你是模型服务商，并认为自己的服务足够稳定且价格实惠，欢迎联系我们，我们会在自行体验和测试后酌情推荐。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📦 生态系统

| NPM                               | 仓库                                    | 描述                                                                                     | 版本                                      |
| --------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------- |
| [@lobehub/ui][lobe-ui-link]       | [lobehub/lobe-ui][lobe-ui-github]       | 构建 AIGC 网页应用程序而设计的开源 UI 组件库                                             | [![][lobe-ui-shield]][lobe-ui-link]       |
| [@lobehub/icons][lobe-icons-link] | [lobehub/lobe-icons][lobe-icons-github] | 主流 AI / LLM 模型和公司 SVG Logo 与 Icon 合集                                           | [![][lobe-icons-shield]][lobe-icons-link] |
| [@lobehub/tts][lobe-tts-link]     | [lobehub/lobe-tts][lobe-tts-github]     | AI TTS / STT 语音合成 / 识别 React Hooks 库                                              | [![][lobe-tts-shield]][lobe-tts-link]     |
| [@lobehub/lint][lobe-lint-link]   | [lobehub/lobe-lint][lobe-lint-github]   | LobeHub 代码样式规范 ESlint，Stylelint，Commitlint，Prettier，Remark 和 Semantic Release | [![][lobe-lint-shield]][lobe-lint-link]   |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🧩 插件体系

插件提供了扩展 LobeHub [Function Calling][docs-function-call] 能力的方法。可以用于引入新的 Function Calling，甚至是新的消息结果渲染方式。如果你对插件开发感兴趣，请在 Wiki 中查阅我们的 [📘 插件开发指引][docs-plugin-dev] 。

- [lobe-chat-plugins][lobe-chat-plugins]：插件索引从该仓库的 index.json 中获取插件列表并显示给用户。
- [chat-plugin-template][chat-plugin-template]：插件开发模版，你可以通过项目模版快速新建插件项目。
- [@lobehub/chat-plugin-sdk][chat-plugin-sdk]：插件 SDK 可帮助您创建出色的 LobeHub 插件。
- [@lobehub/chat-plugins-gateway][chat-plugins-gateway]：插件网关是一个后端服务，作为 LobeHub 插件的网关。我们使用 Vercel 部署此服务。主要的 API POST /api/v1/runner 被部署为 Edge Function。

> \[!NOTE]
>
> 插件系统目前正在进行重大开发。您可以在以下 Issues 中了解更多信息:
>
> - [x] [**插件一期**](https://github.com/lobehub/lobehub/issues/73): 实现插件与主体分离，将插件拆分为独立仓库维护，并实现插件的动态加载
> - [x] [**插件二期**](https://github.com/lobehub/lobehub/issues/97): 插件的安全性与使用的稳定性，更加精准地呈现异常状态，插件架构的可维护性与开发者友好
> - [x] [**插件三期**](https://github.com/lobehub/lobehub/issues/149)：更高阶与完善的自定义能力，支持插件鉴权与示例

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⌨️ 本地开发

可以使用 GitHub Codespaces 进行在线开发：

[![][codespaces-shield]][codespaces-link]

或者使用以下命令进行本地开发：

```fish
$ git clone https://github.com/lobehub/lobehub.git
$ cd lobehub
$ pnpm install
$ pnpm run dev          # 全栈开发（Next.js + Vite SPA）
$ bun run dev:spa       # 仅 SPA 前端（端口 9876）
```

> **Debug Proxy**：运行 `dev:spa` 后，终端会输出代理 URL，如
> `https://app.lobehub.com/_dangerous_local_dev_proxy?debug-host=http%3A%2F%2Flocalhost%3A9876`。
> 打开此链接可在线上环境中加载本地开发服务器，支持 HMR 热更新。

如果你希望了解更多详情，欢迎可以查阅我们的 [📘 开发指南][docs-dev-guide]

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤝 参与贡献

我们非常欢迎各种形式的贡献。如果你对贡献代码感兴趣，可以查看我们的 GitHub [Issues][github-issues-link] 和 [Projects][github-project-link]，大展身手，向我们展示你的奇思妙想。

> \[!TIP]
>
> 我们希望创建一个技术分享型社区，一个可以促进知识共享、想法交流，激发彼此鼓励和协作的环境。
> 同时欢迎联系我们提供产品功能和使用体验反馈，帮助我们将 LobeHub 建设得更好。
>
> **组织维护者:** [@arvinxx](https://github.com/arvinxx) [@canisminor1990](https://github.com/canisminor1990)

[![][pr-welcome-shield]][pr-welcome-link]
[![][submit-agents-shield]][submit-agents-link]
[![][submit-plugin-shield]][submit-plugin-link]

<a href="https://github.com/lobehub/lobehub/graphs/contributors" target="_blank">
  <table>
    <tr>
      <th colspan="2">
        <br><img src="https://contrib.rocks/image?repo=lobehub/lobehub"><br><br>
      </th>
    </tr>
    <tr>
      <td>
        <picture>
          <source media="(prefers-color-scheme: dark)" srcset="https://next.ossinsight.io/widgets/official/compose-org-active-contributors/thumbnail.png?activity=active&period=past_28_days&owner_id=131470832&repo_ids=643445235&image_size=2x3&color_scheme=dark">
          <img src="https://next.ossinsight.io/widgets/official/compose-org-active-contributors/thumbnail.png?activity=active&period=past_28_days&owner_id=131470832&repo_ids=643445235&image_size=2x3&color_scheme=light">
        </picture>
      </td>
      <td rowspan="2">
        <picture>
          <source media="(prefers-color-scheme: dark)" srcset="https://next.ossinsight.io/widgets/official/compose-org-participants-growth/thumbnail.png?activity=active&period=past_28_days&owner_id=131470832&repo_ids=643445235&image_size=4x7&color_scheme=dark">
          <img src="https://next.ossinsight.io/widgets/official/compose-org-participants-growth/thumbnail.png?activity=active&period=past_28_days&owner_id=131470832&repo_ids=643445235&image_size=4x7&color_scheme=light">
        </picture>
      </td>
    </tr>
    <tr>
      <td>
        <picture>
          <source media="(prefers-color-scheme: dark)" srcset="https://next.ossinsight.io/widgets/official/compose-org-active-contributors/thumbnail.png?activity=new&period=past_28_days&owner_id=131470832&repo_ids=643445235&image_size=2x3&color_scheme=dark">
          <img src="https://next.ossinsight.io/widgets/official/compose-org-active-contributors/thumbnail.png?activity=new&period=past_28_days&owner_id=131470832&repo_ids=643445235&image_size=2x3&color_scheme=light">
        </picture>
      </td>
    </tr>
  </table>
</a>

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ❤ 社区赞助

每一分支持都珍贵无比，汇聚成我们支持的璀璨银河！你就像一颗划破夜空的流星，瞬间点亮我们前行的道路。感谢你对我们的信任 —— 你的支持笔就像星辰导航，一次又一次地为项目指明前进的光芒。

<a href="https://opencollective.com/lobehub" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/lobehub/.github/blob/main/static/sponsor-dark.png?raw=true">
    <img  src="https://github.com/lobehub/.github/blob/main/static/sponsor-light.png?raw=true">
  </picture>
</a>

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🔗 更多工具

- **[🅰️ Lobe SD Theme][lobe-theme]:** Stable Diffusion WebUI 的现代主题，精致的界面设计，高度可定制的 UI，以及提高效率的功能。
- **[⛵️ Lobe Midjourney WebUI][lobe-midjourney-webui]:** Midjourney WebUI, 能够根据文本提示快速生成丰富多样的图像，激发创造力，增强对话交流。
- **[🌏 Lobe i18n][lobe-i18n]:** Lobe i18n 是一个由 ChatGPT 驱动的 i18n（国际化）翻译过程的自动化工具。它支持自动分割大文件、增量更新，以及为 OpenAI 模型、API 代理和温度提供定制选项的功能。
- **[💌 Lobe Commit][lobe-commit]:** Lobe Commit 是一个 CLI 工具，它利用 Langchain/ChatGPT 生成基于 Gitmoji 的提交消息。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

---

<details><summary><h4>📝 License</h4></summary>

[![][fossa-license-shield]][fossa-license-link]

</details>

Copyright © 2025 [LobeHub][profile-link]. <br />
This project is [LobeHub Community License](./LICENSE) licensed.

<!-- LINK GROUP -->

[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square
[blog]: https://lobehub.com/zh/blog
[changelog]: https://lobehub.com/changelog
[chat-plugin-sdk]: https://github.com/lobehub/chat-plugin-sdk
[chat-plugin-template]: https://github.com/lobehub/chat-plugin-template
[chat-plugins-gateway]: https://github.com/lobehub/chat-plugins-gateway
[codecov-link]: https://codecov.io/gh/lobehub/lobehub
[codecov-shield]: https://img.shields.io/codecov/c/github/lobehub/lobehub?labelColor=black&style=flat-square&logo=codecov&logoColor=white
[codespaces-link]: https://codespaces.new/lobehub/lobehub
[codespaces-shield]: https://github.com/codespaces/badge.svg
[deploy-button-image]: https://vercel.com/button
[deploy-link]: https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobehub&env=OPENAI_API_KEY&envDescription=Find%20your%20OpenAI%20API%20Key%20by%20click%20the%20right%20Learn%20More%20button.&envLink=https%3A%2F%2Fplatform.openai.com%2Faccount%2Fapi-keys&project-name=lobehub&repository-name=lobehub
[deploy-on-alibaba-cloud-button-image]: https://service-info-public.oss-cn-hangzhou.aliyuncs.com/computenest-en.svg
[deploy-on-alibaba-cloud-link]: https://computenest.console.aliyun.com/service/instance/create/default?type=user&ServiceName=LobeHub%E7%A4%BE%E5%8C%BA%E7%89%88
[deploy-on-sealos-button-image]: https://raw.githubusercontent.com/labring-actions/templates/main/Deploy-on-Sealos.svg
[deploy-on-sealos-link]: https://template.hzh.sealos.run/deploy?templateName=lobehub-db
[deploy-on-zeabur-button-image]: https://zeabur.com/button.svg
[deploy-on-zeabur-link]: https://zeabur.com/templates/VZGGTI
[discord-link]: https://discord.gg/AYFPHvv2jT
[discord-shield]: https://img.shields.io/discord/1127171173982154893?color=5865F2&label=discord&labelColor=black&logo=discord&logoColor=white&style=flat-square
[discord-shield-badge]: https://img.shields.io/discord/1127171173982154893?color=5865F2&label=discord&labelColor=black&logo=discord&logoColor=white&style=for-the-badge
[docker-pulls-link]: https://hub.docker.com/r/lobehub/lobehub
[docker-pulls-shield]: https://img.shields.io/docker/pulls/lobehub/lobehub?color=45cc11&labelColor=black&style=flat-square&sort=semver
[docker-release-link]: https://hub.docker.com/r/lobehub/lobehub
[docker-release-shield]: https://img.shields.io/docker/v/lobehub/lobehub?color=369eff&label=docker&labelColor=black&logo=docker&logoColor=white&style=flat-square&sort=semver
[docker-size-link]: https://hub.docker.com/r/lobehub/lobehub
[docker-size-shield]: https://img.shields.io/docker/image-size/lobehub/lobehub?color=369eff&labelColor=black&style=flat-square&sort=semver
[docs]: https://lobehub.com/zh/docs/usage/start
[docs-dev-guide]: https://lobehub.com/docs/development/start
[docs-docker]: https://lobehub.com/zh/docs/self-hosting/server-database/docker-compose
[docs-env-var]: https://lobehub.com/docs/self-hosting/environment-variables
[docs-feat-agent]: https://lobehub.com/docs/usage/features/agent-market
[docs-feat-artifacts]: https://lobehub.com/docs/usage/features/artifacts
[docs-feat-auth]: https://lobehub.com/docs/usage/features/auth
[docs-feat-branch]: https://lobehub.com/docs/usage/features/branching-conversations
[docs-feat-cot]: https://lobehub.com/docs/usage/features/cot
[docs-feat-database]: https://lobehub.com/docs/usage/features/database
[docs-feat-knowledgebase]: https://lobehub.com/blog/knowledge-base
[docs-feat-local]: https://lobehub.com/docs/usage/features/local-llm
[docs-feat-mobile]: https://lobehub.com/docs/usage/features/mobile
[docs-feat-plugin]: https://lobehub.com/docs/usage/features/plugin-system
[docs-feat-provider]: https://lobehub.com/docs/usage/features/multi-ai-providers
[docs-feat-pwa]: https://lobehub.com/docs/usage/features/pwa
[docs-feat-t2i]: https://lobehub.com/docs/usage/features/text-to-image
[docs-feat-theme]: https://lobehub.com/docs/usage/features/theme
[docs-feat-tts]: https://lobehub.com/docs/usage/features/tts
[docs-feat-vision]: https://lobehub.com/docs/usage/features/vision
[docs-function-call]: https://lobehub.com/zh/blog/openai-function-call
[docs-plugin-dev]: https://lobehub.com/docs/usage/plugins/development
[docs-self-hosting]: https://lobehub.com/docs/self-hosting/start
[docs-upstream-sync]: https://lobehub.com/docs/self-hosting/advanced/upstream-sync
[docs-usage-ollama]: https://lobehub.com/docs/usage/providers/ollama
[docs-usage-plugin]: https://lobehub.com/docs/usage/plugins/basic
[fossa-license-link]: https://app.fossa.com/projects/git%2Bgithub.com%2Flobehub%2Flobehub
[fossa-license-shield]: https://app.fossa.com/api/projects/git%2Bgithub.com%2Flobehub%2Flobehub.svg?type=large
[github-action-release-link]: https://github.com/lobehub/lobehub/actions/workflows/release.yml
[github-action-release-shield]: https://img.shields.io/github/actions/workflow/status/lobehub/lobehub/release.yml?label=release&labelColor=black&logo=githubactions&logoColor=white&style=flat-square
[github-action-test-link]: https://github.com/lobehub/lobehub/actions/workflows/test.yml
[github-action-test-shield]: https://img.shields.io/github/actions/workflow/status/lobehub/lobehub/test.yml?label=test&labelColor=black&logo=githubactions&logoColor=white&style=flat-square
[github-contributors-link]: https://github.com/lobehub/lobehub/graphs/contributors
[github-contributors-shield]: https://img.shields.io/github/contributors/lobehub/lobehub?color=c4f042&labelColor=black&style=flat-square
[github-forks-link]: https://github.com/lobehub/lobehub/network/members
[github-forks-shield]: https://img.shields.io/github/forks/lobehub/lobehub?color=8ae8ff&labelColor=black&style=flat-square
[github-hello-shield]: https://abroad.hellogithub.com/v1/widgets/recommend.svg?rid=39701baf5a734cb894ec812248a5655a&claim_uid=HxYvFN34htJzGCD&theme=dark&theme=neutral&theme=dark&theme=neutral
[github-hello-url]: https://hellogithub.com/repository/39701baf5a734cb894ec812248a5655a
[github-issues-link]: https://github.com/lobehub/lobehub/issues
[github-issues-shield]: https://img.shields.io/github/issues/lobehub/lobehub?color=ff80eb&labelColor=black&style=flat-square
[github-license-link]: https://github.com/lobehub/lobehub/blob/main/LICENSE
[github-license-shield]: https://img.shields.io/badge/license-apache%202.0-white?labelColor=black&style=flat-square
[github-project-link]: https://github.com/lobehub/lobehub/projects
[github-release-link]: https://github.com/lobehub/lobehub/releases
[github-release-shield]: https://img.shields.io/github/v/release/lobehub/lobehub?color=369eff&labelColor=black&logo=github&style=flat-square
[github-releasedate-link]: https://github.com/lobehub/lobehub/releases
[github-releasedate-shield]: https://img.shields.io/github/release-date/lobehub/lobehub?labelColor=black&style=flat-square
[github-stars-link]: https://github.com/lobehub/lobehub/stargazers
[github-stars-shield]: https://github.com/user-attachments/assets/3216e25b-186f-4a54-9cb4-2f124aec0471
[github-trending-shield]: https://trendshift.io/api/badge/repositories/2256
[github-trending-url]: https://trendshift.io/repositories/2256
[image-banner]: https://github.com/user-attachments/assets/0fe626a3-0ddc-4f67-b595-3c5b3f1701e0
[image-feat-agent]: https://github.com/user-attachments/assets/b3ab6e35-4fbc-468d-af10-e3e0c687350f
[image-feat-artifacts]: https://github.com/user-attachments/assets/7f95fad6-b210-4e6e-84a0-7f39e96f3a00
[image-feat-auth]: https://github.com/user-attachments/assets/80bb232e-19d1-4f97-98d6-e291f3585e6d
[image-feat-branch]: https://github.com/user-attachments/assets/92f72082-02bd-4835-9c54-b089aad7fd41
[image-feat-cot]: https://github.com/user-attachments/assets/f74f1139-d115-4e9c-8c43-040a53797a5e
[image-feat-database]: https://github.com/user-attachments/assets/f1697c8b-d1fb-4dac-ba05-153c6295d91d
[image-feat-desktop]: https://github.com/user-attachments/assets/a7bac8d3-ea96-4000-bb39-fadc9b610f96
[image-feat-knowledgebase]: https://github.com/user-attachments/assets/7da7a3b2-92fd-4630-9f4e-8560c74955ae
[image-feat-local]: https://github.com/user-attachments/assets/1239da50-d832-4632-a7ef-bd754c0f3850
[image-feat-mcp-market]: https://github.com/user-attachments/assets/bb114f9f-24c5-4000-a984-c10d187da5a0
[image-feat-mobile]: https://github.com/user-attachments/assets/32cf43c4-96bd-4a4c-bfb6-59acde6fe380
[image-feat-plugin]: https://github.com/user-attachments/assets/66a891ac-01b6-4e3f-b978-2eb07b489b1b
[image-feat-privoder]: https://github.com/user-attachments/assets/e553e407-42de-4919-977d-7dbfcf44a821
[image-feat-pwa]: https://github.com/user-attachments/assets/9647f70f-b71b-43b6-9564-7cdd12d1c24d
[image-feat-t2i]: https://github.com/user-attachments/assets/708274a7-2458-494b-a6ec-b73dfa1fa7c2
[image-feat-theme]: https://github.com/user-attachments/assets/b47c39f1-806f-492b-8fcb-b0fa973937c1
[image-feat-tts]: https://github.com/user-attachments/assets/50189597-2cc3-4002-b4c8-756a52ad5c0a
[image-feat-vision]: https://github.com/user-attachments/assets/18574a1f-46c2-4cbc-af2c-35a86e128a07
[image-feat-web-search]: https://github.com/user-attachments/assets/cfdc48ac-b5f8-4a00-acee-db8f2eba09ad
[image-star]: https://github.com/user-attachments/assets/c3b482e7-cef5-4e94-bef9-226900ecfaab
[issues-link]: https://img.shields.io/github/issues/lobehub/lobehub.svg?style=flat
[lobe-chat-plugins]: https://github.com/lobehub/lobe-chat-plugins
[lobe-commit]: https://github.com/lobehub/lobe-commit/tree/master/packages/lobe-commit
[lobe-i18n]: https://github.com/lobehub/lobe-commit/tree/master/packages/lobe-i18n
[lobe-icons-github]: https://github.com/lobehub/lobe-icons
[lobe-icons-link]: https://www.npmjs.com/package/@lobehub/icons
[lobe-icons-shield]: https://img.shields.io/npm/v/@lobehub/icons?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[lobe-lint-github]: https://github.com/lobehub/lobe-lint
[lobe-lint-link]: https://www.npmjs.com/package/@lobehub/lint
[lobe-lint-shield]: https://img.shields.io/npm/v/@lobehub/lint?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[lobe-midjourney-webui]: https://github.com/lobehub/lobe-midjourney-webui
[lobe-theme]: https://github.com/lobehub/sd-webui-lobe-theme
[lobe-tts-github]: https://github.com/lobehub/lobe-tts
[lobe-tts-link]: https://www.npmjs.com/package/@lobehub/tts
[lobe-tts-shield]: https://img.shields.io/npm/v/@lobehub/tts?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[lobe-ui-github]: https://github.com/lobehub/lobe-ui
[lobe-ui-link]: https://www.npmjs.com/package/@lobehub/ui
[lobe-ui-shield]: https://img.shields.io/npm/v/@lobehub/ui?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[official-site]: https://lobehub.com
[pr-welcome-link]: https://github.com/lobehub/lobehub/pulls
[pr-welcome-shield]: https://img.shields.io/badge/🤯_pr_welcome-%E2%86%92-ffcb47?labelColor=black&style=for-the-badge
[profile-link]: https://github.com/lobehub
[share-mastodon-link]: https://mastodon.social/share?text=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20LobeHub%20-%20An%20open-source,%20extensible%20(Function%20Calling),%20high-performance%20chatbot%20framework.%20It%20supports%20one-click%20free%20deployment%20of%20your%20private%20ChatGPT/LLM%20web%20application.%20https://github.com/lobehub/lobehub%20#chatbot%20#chatGPT%20#openAI
[share-mastodon-shield]: https://img.shields.io/badge/-share%20on%20mastodon-black?labelColor=black&logo=mastodon&logoColor=white&style=flat-square
[share-reddit-link]: https://www.reddit.com/submit?title=%E6%8E%A8%E8%8D%90%E4%B8%80%E4%B8%AA%20GitHub%20%E5%BC%80%E6%BA%90%E9%A1%B9%E7%9B%AE%20%F0%9F%A4%AF%20LobeHub%20-%20%E5%BC%80%E6%BA%90%E7%9A%84%E3%80%81%E5%8F%AF%E6%89%A9%E5%B1%95%E7%9A%84%EF%BC%88Function%20Calling%EF%BC%89%E9%AB%98%E6%80%A7%E8%83%BD%E8%81%8A%E5%A4%A9%E6%9C%BA%E5%99%A8%E4%BA%BA%E6%A1%86%E6%9E%B6%E3%80%82%0A%E5%AE%83%E6%94%AF%E6%8C%81%E4%B8%80%E9%94%AE%E5%85%8D%E8%B4%B9%E9%83%A8%E7%BD%B2%E7%A7%81%E4%BA%BA%20ChatGPT%2FLLM%20%E7%BD%91%E9%A1%B5%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F%20%23chatbot%20%23chatGPT%20%23openAI&url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobehub
[share-reddit-shield]: https://img.shields.io/badge/-share%20on%20reddit-black?labelColor=black&logo=reddit&logoColor=white&style=flat-square
[share-telegram-link]: https://t.me/share/url"?text=%E6%8E%A8%E8%8D%90%E4%B8%80%E4%B8%AA%20GitHub%20%E5%BC%80%E6%BA%90%E9%A1%B9%E7%9B%AE%20%F0%9F%A4%AF%20LobeHub%20-%20%E5%BC%80%E6%BA%90%E7%9A%84%E3%80%81%E5%8F%AF%E6%89%A9%E5%B1%95%E7%9A%84%EF%BC%88Function%20Calling%EF%BC%89%E9%AB%98%E6%80%A7%E8%83%BD%E8%81%8A%E5%A4%A9%E6%9C%BA%E5%99%A8%E4%BA%BA%E6%A1%86%E6%9E%B6%E3%80%82%0A%E5%AE%83%E6%94%AF%E6%8C%81%E4%B8%80%E9%94%AE%E5%85%8D%E8%B4%B9%E9%83%A8%E7%BD%B2%E7%A7%81%E4%BA%BA%20ChatGPT%2FLLM%20%E7%BD%91%E9%A1%B5%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F%20%23chatbot%20%23chatGPT%20%23openAI&url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobehub
[share-telegram-shield]: https://img.shields.io/badge/-share%20on%20telegram-black?labelColor=black&logo=telegram&logoColor=white&style=flat-square
[share-weibo-link]: http://service.weibo.com/share/share.php?sharesource=weibo&title=%E6%8E%A8%E8%8D%90%E4%B8%80%E4%B8%AA%20GitHub%20%E5%BC%80%E6%BA%90%E9%A1%B9%E7%9B%AE%20%F0%9F%A4%AF%20LobeHub%20-%20%E5%BC%80%E6%BA%90%E7%9A%84%E3%80%81%E5%8F%AF%E6%89%A9%E5%B1%95%E7%9A%84%EF%BC%88Function%20Calling%EF%BC%89%E9%AB%98%E6%80%A7%E8%83%BD%E8%81%8A%E5%A4%A9%E6%9C%BA%E5%99%A8%E4%BA%BA%E6%A1%86%E6%9E%B6%E3%80%82%0A%E5%AE%83%E6%94%AF%E6%8C%81%E4%B8%80%E9%94%AE%E5%85%8D%E8%B4%B9%E9%83%A8%E7%BD%B2%E7%A7%81%E4%BA%BA%20ChatGPT%2FLLM%20%E7%BD%91%E9%A1%B5%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F%20%23chatbot%20%23chatGPT%20%23openAI&url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobehub
[share-weibo-shield]: https://img.shields.io/badge/-share%20on%20weibo-black?labelColor=black&logo=sinaweibo&logoColor=white&style=flat-square
[share-whatsapp-link]: https://api.whatsapp.com/send?text=%E6%8E%A8%E8%8D%90%E4%B8%80%E4%B8%AA%20GitHub%20%E5%BC%80%E6%BA%90%E9%A1%B9%E7%9B%AE%20%F0%9F%A4%AF%20LobeHub%20-%20%E5%BC%80%E6%BA%90%E7%9A%84%E3%80%81%E5%8F%AF%E6%89%A9%E5%B1%95%E7%9A%84%EF%BC%88Function%20Calling%EF%BC%89%E9%AB%98%E6%80%A7%E8%83%BD%E8%81%8A%E5%A4%A9%E6%9C%BA%E5%99%A8%E4%BA%BA%E6%A1%86%E6%9E%B6%E3%80%82%0A%E5%AE%83%E6%94%AF%E6%8C%81%E4%B8%80%E9%94%AE%E5%85%8D%E8%B4%B9%E9%83%A8%E7%BD%B2%E7%A7%81%E4%BA%BA%20ChatGPT%2FLLM%20%E7%BD%91%E9%A1%B5%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F%20https%3A%2F%2Fgithub.com%2Flobehub%2Flobehub%20%23chatbot%20%23chatGPT%20%23openAI
[share-whatsapp-shield]: https://img.shields.io/badge/-share%20on%20whatsapp-black?labelColor=black&logo=whatsapp&logoColor=white&style=flat-square
[share-x-link]: https://x.com/intent/tweet?hashtags=chatbot%2CchatGPT%2CopenAI&text=%E6%8E%A8%E8%8D%90%E4%B8%80%E4%B8%AA%20GitHub%20%E5%BC%80%E6%BA%90%E9%A1%B9%E7%9B%AE%20%F0%9F%A4%AF%20LobeHub%20-%20%E5%BC%80%E6%BA%90%E7%9A%84%E3%80%81%E5%8F%AF%E6%89%A9%E5%B1%95%E7%9A%84%EF%BC%88Function%20Calling%EF%BC%89%E9%AB%98%E6%80%A7%E8%83%BD%E8%81%8A%E5%A4%A9%E6%9C%BA%E5%99%A8%E4%BA%BA%E6%A1%86%E6%9E%B6%E3%80%82%0A%E5%AE%83%E6%94%AF%E6%8C%81%E4%B8%80%E9%94%AE%E5%85%8D%E8%B4%B9%E9%83%A8%E7%BD%B2%E7%A7%81%E4%BA%BA%20ChatGPT%2FLLM%20%E7%BD%91%E9%A1%B5%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F&url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobehub
[share-x-shield]: https://img.shields.io/badge/-share%20on%20x-black?labelColor=black&logo=x&logoColor=white&style=flat-square
[sponsor-link]: https://opencollective.com/lobehub 'Become ❤ LobeHub Sponsor'
[sponsor-shield]: https://img.shields.io/badge/-Sponsor%20LobeHub-f04f88?logo=opencollective&logoColor=white&style=flat-square
[submit-agents-link]: https://github.com/lobehub/lobe-chat-agents
[submit-agents-shield]: https://img.shields.io/badge/🤖/🏪_submit_agent-%E2%86%92-c4f042?labelColor=black&style=for-the-badge
[submit-plugin-link]: https://github.com/lobehub/lobe-chat-plugins
[submit-plugin-shield]: https://img.shields.io/badge/🧩/🏪_submit_plugin-%E2%86%92-95f3d9?labelColor=black&style=for-the-badge
[vercel-link]: https://chat-preview.lobehub.com
[vercel-shield]: https://img.shields.io/badge/vercel-online-55b467?labelColor=black&logo=vercel&style=flat-square



================================================
FILE: AGENTS.md
================================================
# LobeHub Development Guidelines

This document serves as a comprehensive guide for all team members when developing LobeHub.

## Project Description

You are developing an open-source, modern-design AI Agent Workspace: LobeHub (previously LobeChat).

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **UI Components**: Ant Design, @lobehub/ui, antd-style
- **State Management**: Zustand, SWR
- **Database**: PostgreSQL, PGLite, Drizzle ORM
- **Testing**: Vitest, Testing Library
- **Package Manager**: pnpm (monorepo structure)

## Directory Structure

```plaintext
lobehub/
├── apps/desktop/           # Electron desktop app
├── packages/               # Shared packages (@lobechat/*)
│   ├── database/           # Database schemas, models, repositories
│   ├── agent-runtime/      # Agent runtime
│   └── ...
├── src/
│   ├── app/                # Next.js app router
│   ├── spa/                # SPA entry points (entry.*.tsx) and router config
│   ├── routes/             # SPA page components (roots)
│   ├── features/           # Business components by domain
│   ├── store/              # Zustand stores
│   ├── services/           # Client services
│   ├── server/             # Server services and routers
│   └── ...
├── .agents/skills/         # AI development skills
└── e2e/                    # E2E tests (Cucumber + Playwright)
```

## Development Workflow

### Git Workflow

- **Branch strategy**: `canary` is the development branch (cloud production); `main` is the release branch (periodically cherry-picks from canary)
- New branches should be created from `canary`; PRs should target `canary`
- Use rebase for git pull
- Git commit messages should prefix with gitmoji
- Git branch name format: `feat/feature-name`
- Use `.github/PULL_REQUEST_TEMPLATE.md` for PR descriptions
- **Protection of local changes**: Never use `git restore`, `git checkout --`, `git reset --hard`, or any other command or workflow that can forcibly overwrite, discard, or silently replace user-owned uncommitted changes. Before any revert or restoration affecting existing files, inspect the working tree carefully and obtain explicit user confirmation.

### Package Management

- Use `pnpm` as the primary package manager
- Use `bun` to run npm scripts
- Use `bunx` to run executable npm packages

### Code Style Guidelines

#### TypeScript

- Prefer interfaces over types for object shapes

### Testing Strategy

```bash
# Web tests
bunx vitest run --silent='passed-only' '[file-path-pattern]'

# Package tests (e.g., database)
cd packages/[package-name] && bunx vitest run --silent='passed-only' '[file-path-pattern]'
```

**Important Notes**:

- Wrap file paths in single quotes to avoid shell expansion
- Never run `bun run test` - this runs all tests and takes \~10 minutes

### Type Checking

- Use `bun run type-check` to check for type errors

### i18n

- **Keys**: Add to `src/locales/default/namespace.ts`
- **Dev**: Translate `locales/zh-CN/namespace.json` locale file only for preview
- DON'T run `pnpm i18n`, let CI auto handle it

## SPA Routes and Features

- **`src/routes/`** holds only page segments (`_layout/index.tsx`, `index.tsx`, `[id]/index.tsx`). Keep route files **thin** — import from `@/features/*` and compose, no business logic.
- **`src/features/`** holds business components by **domain** (e.g. `Pages`, `PageEditor`, `Home`). Layout pieces, hooks, and domain UI go here.
- **Desktop router parity:** When changing the main SPA route tree, update **both** `src/spa/router/desktopRouter.config.tsx` (dynamic imports) and `src/spa/router/desktopRouter.config.desktop.tsx` (sync imports) so paths and nesting match. Changing only one can leave routes unregistered and cause **blank screens**.
- See the **spa-routes** skill (`.agents/skills/spa-routes/SKILL.md`) for the full convention and file-division rules.

## Skills (Auto-loaded)

All AI development skills are available in `.agents/skills/` directory and auto-loaded by Claude Code when relevant.

**IMPORTANT**: When reviewing PRs or code diffs, ALWAYS read `.agents/skills/code-review/SKILL.md` first.



================================================
FILE: CHANGELOG.md
================================================
<a name="readme-top"></a>

# Changelog

## [Version 2.1.51](https://github.com/lobehub/lobe-chat/compare/v0.0.0-nightly.pr13850.8503...v2.1.51)

<sup>Released on **2026-04-16**</sup>

#### 👷 Build System

- **database**: add document history schema.
- **database**: add document history schema.

#### 🐛 Bug Fixes

- **misc**: fix minify cli.
- **misc**: recent delete.
- **deps**: pin @react-pdf/image to 3.0.4 to avoid privatized @react-pdf/svg.
- **database**: enforce document history ownership and pagination.

#### ✨ Features

- **database**: add document history table and update related models.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### Build System

- **database**: add document history schema, closes [#13789](https://github.com/lobehub/lobe-chat/issues/13789) ([c1174d3](https://github.com/lobehub/lobe-chat/commit/c1174d3))
- **database**: add document history schema ([e3eef04](https://github.com/lobehub/lobe-chat/commit/e3eef04))

#### What's fixed

- **misc**: fix minify cli, closes [#13888](https://github.com/lobehub/lobe-chat/issues/13888) ([cb4ad01](https://github.com/lobehub/lobe-chat/commit/cb4ad01))
- **misc**: recent delete, closes [#13878](https://github.com/lobehub/lobe-chat/issues/13878) ([85227cf](https://github.com/lobehub/lobe-chat/commit/85227cf))
- **deps**: pin @react-pdf/image to 3.0.4 to avoid privatized @react-pdf/svg ([d526b40](https://github.com/lobehub/lobe-chat/commit/d526b40))
- **database**: enforce document history ownership and pagination ([b9c4b87](https://github.com/lobehub/lobe-chat/commit/b9c4b87))

#### What's improved

- **database**: add document history table and update related models ([64fc6d4](https://github.com/lobehub/lobe-chat/commit/64fc6d4))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

## [Version 2.1.50](https://github.com/lobehub/lobe-chat/compare/v2.1.49...v2.1.50)

<sup>Released on **2026-04-16**</sup>

#### 👷 Build System

- **database**: add document history schema.
- **database**: add document history schema.

#### 🐛 Bug Fixes

- **deps**: pin @react-pdf/image to 3.0.4 to avoid privatized @react-pdf/svg.
- **database**: enforce document history ownership and pagination.

#### ✨ Features

- **database**: add document history table and update related models.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### Build System

- **database**: add document history schema, closes [#13789](https://github.com/lobehub/lobe-chat/issues/13789) ([c1174d3](https://github.com/lobehub/lobe-chat/commit/c1174d3))
- **database**: add document history schema ([e3eef04](https://github.com/lobehub/lobe-chat/commit/e3eef04))

#### What's fixed

- **deps**: pin @react-pdf/image to 3.0.4 to avoid privatized @react-pdf/svg ([d526b40](https://github.com/lobehub/lobe-chat/commit/d526b40))
- **database**: enforce document history ownership and pagination ([b9c4b87](https://github.com/lobehub/lobe-chat/commit/b9c4b87))

#### What's improved

- **database**: add document history table and update related models ([64fc6d4](https://github.com/lobehub/lobe-chat/commit/64fc6d4))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.45](https://github.com/lobehub/lobe-chat/compare/v2.1.44...v2.1.45)

<sup>Released on **2026-03-26**</sup>

#### 👷 Build System

- **misc**: add agent task system database schema.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### Build System

- **misc**: add agent task system database schema, closes [#13280](https://github.com/lobehub/lobe-chat/issues/13280) ([b005a9c](https://github.com/lobehub/lobe-chat/commit/b005a9c))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.44](https://github.com/lobehub/lobe-chat/compare/v2.2.0-nightly.202603200623...v2.1.44)

<sup>Released on **2026-03-20**</sup>

#### 🐛 Bug Fixes

- **misc**: misc UI/UX improvements and bug fixes.

#### 💄 Styles

- **misc**: add image/video switch.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **misc**: misc UI/UX improvements and bug fixes, closes [#13153](https://github.com/lobehub/lobe-chat/issues/13153) ([abd152b](https://github.com/lobehub/lobe-chat/commit/abd152b))

#### Styles

- **misc**: add image/video switch, closes [#13152](https://github.com/lobehub/lobe-chat/issues/13152) ([2067cb2](https://github.com/lobehub/lobe-chat/commit/2067cb2))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.43](https://github.com/lobehub/lobe-chat/compare/v2.1.42...v2.1.43)

<sup>Released on **2026-03-16**</sup>

#### 👷 Build System

- **misc**: add BM25 indexes with ICU tokenizer for search optimization.
- **misc**: add `agent_documents` table.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### Build System

- **misc**: add BM25 indexes with ICU tokenizer for search optimization, closes [#13032](https://github.com/lobehub/lobe-chat/issues/13032) ([70a74f4](https://github.com/lobehub/lobe-chat/commit/70a74f4))
- **misc**: add `agent_documents` table, closes [#12944](https://github.com/lobehub/lobe-chat/issues/12944) ([93ee1e3](https://github.com/lobehub/lobe-chat/commit/93ee1e3))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.42](https://github.com/lobehub/lobe-chat/compare/v2.1.41...v2.1.42)

<sup>Released on **2026-03-14**</sup>

#### 🐛 Bug Fixes

- **ci**: create stable update manifests for S3 publish.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **ci**: create stable update manifests for S3 publish, closes [#12974](https://github.com/lobehub/lobe-chat/issues/12974) ([9bb9222](https://github.com/lobehub/lobe-chat/commit/9bb9222))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.40](https://github.com/lobehub/lobe-chat/compare/v2.1.39...v2.1.40)

<sup>Released on **2026-03-12**</sup>

#### 👷 Build System

- **misc**: add description column to topics table.
- **misc**: add migration to enable `pg_search` extension.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### Build System

- **misc**: add description column to topics table, closes [#12939](https://github.com/lobehub/lobe-chat/issues/12939) ([3091489](https://github.com/lobehub/lobe-chat/commit/3091489))
- **misc**: add migration to enable `pg_search` extension, closes [#12874](https://github.com/lobehub/lobe-chat/issues/12874) ([258e9cb](https://github.com/lobehub/lobe-chat/commit/258e9cb))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.39](https://github.com/lobehub/lobe-chat/compare/v2.1.38...v2.1.39)

<sup>Released on **2026-03-09**</sup>

#### 👷 Build System

- **misc**: add api key hash column migration.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### Build System

- **misc**: add api key hash column migration, closes [#12862](https://github.com/lobehub/lobe-chat/issues/12862) ([4e6790e](https://github.com/lobehub/lobe-chat/commit/4e6790e))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.38](https://github.com/lobehub/lobe-chat/compare/v2.1.37-canary.4...v2.1.38)

<sup>Released on **2026-03-06**</sup>

#### 👷 Build System

- **ci**: fix changelog auto-generation in release workflow.

#### 🐛 Bug Fixes

- **misc**: when use trustclient not register market m2m token.
- **ci**: correct stable renderer tar source path.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### Build System

- **ci**: fix changelog auto-generation in release workflow, closes [#12765](https://github.com/lobehub/lobe-chat/issues/12765) ([0b7c917](https://github.com/lobehub/lobe-chat/commit/0b7c917))

#### What's fixed

- **misc**: when use trustclient not register market m2m token, closes [#12762](https://github.com/lobehub/lobe-chat/issues/12762) ([400a020](https://github.com/lobehub/lobe-chat/commit/400a020))
- **ci**: correct stable renderer tar source path, closes [#12755](https://github.com/lobehub/lobe-chat/issues/12755) ([d3550af](https://github.com/lobehub/lobe-chat/commit/d3550af))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.26](https://github.com/lobehub/lobe-chat/compare/v2.1.25...v2.1.26)

<sup>Released on **2026-02-10**</sup>

#### 💄 Styles

- **misc**: Update i18n.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### Styles

- **misc**: Update i18n, closes [#12227](https://github.com/lobehub/lobe-chat/issues/12227) ([37b06c4](https://github.com/lobehub/lobe-chat/commit/37b06c4))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.25](https://github.com/lobehub/lobe-chat/compare/v2.1.24...v2.1.25)

<sup>Released on **2026-02-09**</sup>

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.24](https://github.com/lobehub/lobe-chat/compare/v2.1.23...v2.1.24)

<sup>Released on **2026-02-09**</sup>

#### 🐛 Bug Fixes

- **misc**: Fix multimodal content_part images rendered as base64 text.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **misc**: Fix multimodal content_part images rendered as base64 text, closes [#12210](https://github.com/lobehub/lobe-chat/issues/12210) ([00ff5b9](https://github.com/lobehub/lobe-chat/commit/00ff5b9))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.23](https://github.com/lobehub/lobe-chat/compare/v2.1.22...v2.1.23)

<sup>Released on **2026-02-09**</sup>

#### 🐛 Bug Fixes

- **swr**: Prevent useActionSWR isValidating from getting stuck.
- **misc**: Fix editor content missing when send error, use custom avatar for group chat in sidebar.

#### 💄 Styles

- **misc**: Update i18n.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **swr**: Prevent useActionSWR isValidating from getting stuck, closes [#12059](https://github.com/lobehub/lobe-chat/issues/12059) ([8877bc1](https://github.com/lobehub/lobe-chat/commit/8877bc1))
- **misc**: Fix editor content missing when send error, closes [#12205](https://github.com/lobehub/lobe-chat/issues/12205) ([ee7ae5b](https://github.com/lobehub/lobe-chat/commit/ee7ae5b))
- **misc**: Use custom avatar for group chat in sidebar, closes [#12208](https://github.com/lobehub/lobe-chat/issues/12208) ([31145c9](https://github.com/lobehub/lobe-chat/commit/31145c9))

#### Styles

- **misc**: Update i18n, closes [#12025](https://github.com/lobehub/lobe-chat/issues/12025) ([c12d022](https://github.com/lobehub/lobe-chat/commit/c12d022))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.23](https://github.com/lobehub/lobe-chat/compare/v2.1.22...v2.1.23)

<sup>Released on **2026-02-08**</sup>

#### 🐛 Bug Fixes

- **misc**: Fix editor content missing when send error.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **misc**: Fix editor content missing when send error, closes [#12205](https://github.com/lobehub/lobe-chat/issues/12205) ([ee7ae5b](https://github.com/lobehub/lobe-chat/commit/ee7ae5b))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.23](https://github.com/lobehub/lobe-chat/compare/v2.1.22...v2.1.23)

<sup>Released on **2026-02-08**</sup>

#### 🐛 Bug Fixes

- **misc**: Fix editor content missing when send error.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **misc**: Fix editor content missing when send error, closes [#12205](https://github.com/lobehub/lobe-chat/issues/12205) ([ee7ae5b](https://github.com/lobehub/lobe-chat/commit/ee7ae5b))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.22](https://github.com/lobehub/lobe-chat/compare/v2.1.21...v2.1.22)

<sup>Released on **2026-02-08**</sup>

#### 🐛 Bug Fixes

- **misc**: Register Notebook tool in server runtime.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **misc**: Register Notebook tool in server runtime, closes [#12203](https://github.com/lobehub/lobe-chat/issues/12203) ([be6da39](https://github.com/lobehub/lobe-chat/commit/be6da39))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.21](https://github.com/lobehub/lobe-chat/compare/v2.1.20...v2.1.21)

<sup>Released on **2026-02-08**</sup>

#### 🐛 Bug Fixes

- **misc**: Add end-user info on OpenAI Responses API call, enable vertical scrolling for topic list on mobile.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **misc**: Add end-user info on OpenAI Responses API call, closes [#12134](https://github.com/lobehub/lobe-chat/issues/12134) ([72a85ac](https://github.com/lobehub/lobe-chat/commit/72a85ac))
- **misc**: Enable vertical scrolling for topic list on mobile, closes [#12157](https://github.com/lobehub/lobe-chat/issues/12157) [lobehub/lobe-chat#12029](https://github.com/lobehub/lobe-chat/issues/12029) ([bd4e253](https://github.com/lobehub/lobe-chat/commit/bd4e253))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.21](https://github.com/lobehub/lobe-chat/compare/v2.1.20...v2.1.21)

<sup>Released on **2026-02-08**</sup>

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.21](https://github.com/lobehub/lobe-chat/compare/v2.1.20...v2.1.21)

<sup>Released on **2026-02-08**</sup>

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.20](https://github.com/lobehub/lobe-chat/compare/v2.1.19...v2.1.20)

<sup>Released on **2026-02-08**</sup>

#### 🐛 Bug Fixes

- **misc**: Add api/version and api/desktop to public routes, show notification when file upload fails due to storage plan limit.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **misc**: Add api/version and api/desktop to public routes, closes [#12194](https://github.com/lobehub/lobe-chat/issues/12194) ([ea81cd4](https://github.com/lobehub/lobe-chat/commit/ea81cd4))
- **misc**: Show notification when file upload fails due to storage plan limit, closes [#12176](https://github.com/lobehub/lobe-chat/issues/12176) ([f26d0df](https://github.com/lobehub/lobe-chat/commit/f26d0df))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.20](https://github.com/lobehub/lobe-chat/compare/v2.1.19...v2.1.20)

<sup>Released on **2026-02-08**</sup>

#### 🐛 Bug Fixes

- **misc**: Add api/version and api/desktop to public routes, show notification when file upload fails due to storage plan limit.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **misc**: Add api/version and api/desktop to public routes, closes [#12194](https://github.com/lobehub/lobe-chat/issues/12194) ([ea81cd4](https://github.com/lobehub/lobe-chat/commit/ea81cd4))
- **misc**: Show notification when file upload fails due to storage plan limit, closes [#12176](https://github.com/lobehub/lobe-chat/issues/12176) ([f26d0df](https://github.com/lobehub/lobe-chat/commit/f26d0df))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.20](https://github.com/lobehub/lobe-chat/compare/v2.1.19...v2.1.20)

<sup>Released on **2026-02-07**</sup>

#### 🐛 Bug Fixes

- **misc**: Show notification when file upload fails due to storage plan limit.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **misc**: Show notification when file upload fails due to storage plan limit, closes [#12176](https://github.com/lobehub/lobe-chat/issues/12176) ([f26d0df](https://github.com/lobehub/lobe-chat/commit/f26d0df))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.20](https://github.com/lobehub/lobe-chat/compare/v2.1.19...v2.1.20)

<sup>Released on **2026-02-07**</sup>

#### 🐛 Bug Fixes

- **misc**: Show notification when file upload fails due to storage plan limit.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **misc**: Show notification when file upload fails due to storage plan limit, closes [#12176](https://github.com/lobehub/lobe-chat/issues/12176) ([f26d0df](https://github.com/lobehub/lobe-chat/commit/f26d0df))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.19](https://github.com/lobehub/lobe-chat/compare/v2.1.18...v2.1.19)

<sup>Released on **2026-02-06**</sup>

#### ♻ Code Refactoring

- **docker-compose**: Restructure dev environment.
- **misc**: Upgrade agents/group detail pages tabs、hidden like button.

#### 🐛 Bug Fixes

- **misc**: Fixed in community pluings tab the lobehub skills not display.

#### 💄 Styles

- **model-runtime**: Add Claude Opus 4.6 support for Bedrock runtime.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### Code refactoring

- **docker-compose**: Restructure dev environment, closes [#12132](https://github.com/lobehub/lobe-chat/issues/12132) ([7ba15cc](https://github.com/lobehub/lobe-chat/commit/7ba15cc))
- **misc**: Upgrade agents/group detail pages tabs、hidden like button, closes [#12127](https://github.com/lobehub/lobe-chat/issues/12127) ([e402c51](https://github.com/lobehub/lobe-chat/commit/e402c51))

#### What's fixed

- **misc**: Fixed in community pluings tab the lobehub skills not display, closes [#12141](https://github.com/lobehub/lobe-chat/issues/12141) ([193c96f](https://github.com/lobehub/lobe-chat/commit/193c96f))

#### Styles

- **model-runtime**: Add Claude Opus 4.6 support for Bedrock runtime, closes [#12155](https://github.com/lobehub/lobe-chat/issues/12155) ([90a75af](https://github.com/lobehub/lobe-chat/commit/90a75af))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.19](https://github.com/lobehub/lobe-chat/compare/v2.1.18...v2.1.19)

<sup>Released on **2026-02-06**</sup>

#### ♻ Code Refactoring

- **docker-compose**: Restructure dev environment.
- **misc**: Upgrade agents/group detail pages tabs、hidden like button.

#### 🐛 Bug Fixes

- **misc**: Fixed in community pluings tab the lobehub skills not display.

#### 💄 Styles

- **model-runtime**: Add Claude Opus 4.6 support for Bedrock runtime.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### Code refactoring

- **docker-compose**: Restructure dev environment, closes [#12132](https://github.com/lobehub/lobe-chat/issues/12132) ([7ba15cc](https://github.com/lobehub/lobe-chat/commit/7ba15cc))
- **misc**: Upgrade agents/group detail pages tabs、hidden like button, closes [#12127](https://github.com/lobehub/lobe-chat/issues/12127) ([e402c51](https://github.com/lobehub/lobe-chat/commit/e402c51))

#### What's fixed

- **misc**: Fixed in community pluings tab the lobehub skills not display, closes [#12141](https://github.com/lobehub/lobe-chat/issues/12141) ([193c96f](https://github.com/lobehub/lobe-chat/commit/193c96f))

#### Styles

- **model-runtime**: Add Claude Opus 4.6 support for Bedrock runtime, closes [#12155](https://github.com/lobehub/lobe-chat/issues/12155) ([90a75af](https://github.com/lobehub/lobe-chat/commit/90a75af))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.19](https://github.com/lobehub/lobe-chat/compare/v2.1.18...v2.1.19)

<sup>Released on **2026-02-06**</sup>

#### ♻ Code Refactoring

- **docker-compose**: Restructure dev environment.
- **misc**: Upgrade agents/group detail pages tabs、hidden like button.

#### 🐛 Bug Fixes

- **misc**: Fixed in community pluings tab the lobehub skills not display.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### Code refactoring

- **docker-compose**: Restructure dev environment, closes [#12132](https://github.com/lobehub/lobe-chat/issues/12132) ([7ba15cc](https://github.com/lobehub/lobe-chat/commit/7ba15cc))
- **misc**: Upgrade agents/group detail pages tabs、hidden like button, closes [#12127](https://github.com/lobehub/lobe-chat/issues/12127) ([e402c51](https://github.com/lobehub/lobe-chat/commit/e402c51))

#### What's fixed

- **misc**: Fixed in community pluings tab the lobehub skills not display, closes [#12141](https://github.com/lobehub/lobe-chat/issues/12141) ([193c96f](https://github.com/lobehub/lobe-chat/commit/193c96f))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.19](https://github.com/lobehub/lobe-chat/compare/v2.1.18...v2.1.19)

<sup>Released on **2026-02-06**</sup>

#### ♻ Code Refactoring

- **docker-compose**: Restructure dev environment.
- **misc**: Upgrade agents/group detail pages tabs、hidden like button.

#### 🐛 Bug Fixes

- **misc**: Fixed in community pluings tab the lobehub skills not display.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### Code refactoring

- **docker-compose**: Restructure dev environment, closes [#12132](https://github.com/lobehub/lobe-chat/issues/12132) ([7ba15cc](https://github.com/lobehub/lobe-chat/commit/7ba15cc))
- **misc**: Upgrade agents/group detail pages tabs、hidden like button, closes [#12127](https://github.com/lobehub/lobe-chat/issues/12127) ([e402c51](https://github.com/lobehub/lobe-chat/commit/e402c51))

#### What's fixed

- **misc**: Fixed in community pluings tab the lobehub skills not display, closes [#12141](https://github.com/lobehub/lobe-chat/issues/12141) ([193c96f](https://github.com/lobehub/lobe-chat/commit/193c96f))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.19](https://github.com/lobehub/lobe-chat/compare/v2.1.18...v2.1.19)

<sup>Released on **2026-02-06**</sup>

#### ♻ Code Refactoring

- **docker-compose**: Restructure dev environment.
- **misc**: Upgrade agents/group detail pages tabs、hidden like button.

#### 🐛 Bug Fixes

- **misc**: Fixed in community pluings tab the lobehub skills not display.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### Code refactoring

- **docker-compose**: Restructure dev environment, closes [#12132](https://github.com/lobehub/lobe-chat/issues/12132) ([7ba15cc](https://github.com/lobehub/lobe-chat/commit/7ba15cc))
- **misc**: Upgrade agents/group detail pages tabs、hidden like button, closes [#12127](https://github.com/lobehub/lobe-chat/issues/12127) ([e402c51](https://github.com/lobehub/lobe-chat/commit/e402c51))

#### What's fixed

- **misc**: Fixed in community pluings tab the lobehub skills not display, closes [#12141](https://github.com/lobehub/lobe-chat/issues/12141) ([193c96f](https://github.com/lobehub/lobe-chat/commit/193c96f))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.19](https://github.com/lobehub/lobe-chat/compare/v2.1.18...v2.1.19)

<sup>Released on **2026-02-06**</sup>

#### ♻ Code Refactoring

- **docker-compose**: Restructure dev environment.
- **misc**: Upgrade agents/group detail pages tabs、hidden like button.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### Code refactoring

- **docker-compose**: Restructure dev environment, closes [#12132](https://github.com/lobehub/lobe-chat/issues/12132) ([7ba15cc](https://github.com/lobehub/lobe-chat/commit/7ba15cc))
- **misc**: Upgrade agents/group detail pages tabs、hidden like button, closes [#12127](https://github.com/lobehub/lobe-chat/issues/12127) ([e402c51](https://github.com/lobehub/lobe-chat/commit/e402c51))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.19](https://github.com/lobehub/lobe-chat/compare/v2.1.18...v2.1.19)

<sup>Released on **2026-02-05**</sup>

#### ♻ Code Refactoring

- **misc**: Upgrade agents/group detail pages tabs、hidden like button.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### Code refactoring

- **misc**: Upgrade agents/group detail pages tabs、hidden like button, closes [#12127](https://github.com/lobehub/lobe-chat/issues/12127) ([e402c51](https://github.com/lobehub/lobe-chat/commit/e402c51))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.18](https://github.com/lobehub/lobe-chat/compare/v2.1.17...v2.1.18)

<sup>Released on **2026-02-04**</sup>

#### 🐛 Bug Fixes

- **model-runtime**: Fix moonshot interleaved thinking and circular dependency.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **model-runtime**: Fix moonshot interleaved thinking and circular dependency, closes [#12112](https://github.com/lobehub/lobe-chat/issues/12112) ([3f1a198](https://github.com/lobehub/lobe-chat/commit/3f1a198))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.17](https://github.com/lobehub/lobe-chat/compare/v2.1.16...v2.1.17)

<sup>Released on **2026-02-04**</sup>

#### ♻ Code Refactoring

- **model-runtime**: Extract Anthropic factory and convert Moonshot to RouterRuntime.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### Code refactoring

- **model-runtime**: Extract Anthropic factory and convert Moonshot to RouterRuntime, closes [#12109](https://github.com/lobehub/lobe-chat/issues/12109) ([71064fd](https://github.com/lobehub/lobe-chat/commit/71064fd))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.16](https://github.com/lobehub/lobe-chat/compare/v2.1.15...v2.1.16)

<sup>Released on **2026-02-04**</sup>

#### 🐛 Bug Fixes

- **misc**: Add the preview publish to market button preview check.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **misc**: Add the preview publish to market button preview check, closes [#12105](https://github.com/lobehub/lobe-chat/issues/12105) ([28887c7](https://github.com/lobehub/lobe-chat/commit/28887c7))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.15](https://github.com/lobehub/lobe-chat/compare/v2.1.14...v2.1.15)

<sup>Released on **2026-02-04**</sup>

#### 🐛 Bug Fixes

- **misc**: Fixed the agents list the show updateAt time error.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **misc**: Fixed the agents list the show updateAt time error, closes [#12103](https://github.com/lobehub/lobe-chat/issues/12103) ([3063cee](https://github.com/lobehub/lobe-chat/commit/3063cee))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.14](https://github.com/lobehub/lobe-chat/compare/v2.1.13...v2.1.14)

<sup>Released on **2026-02-04**</sup>

#### 🐛 Bug Fixes

- **misc**: Fix cannot uncompressed messages.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **misc**: Fix cannot uncompressed messages, closes [#12086](https://github.com/lobehub/lobe-chat/issues/12086) ([ccfaec2](https://github.com/lobehub/lobe-chat/commit/ccfaec2))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.13](https://github.com/lobehub/lobe-chat/compare/v2.1.12...v2.1.13)

<sup>Released on **2026-02-03**</sup>

#### 🐛 Bug Fixes

- **docker**: Add librt.so.1 to fix PDF parsing.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **docker**: Add librt.so.1 to fix PDF parsing, closes [#12039](https://github.com/lobehub/lobe-chat/issues/12039) ([4a6be92](https://github.com/lobehub/lobe-chat/commit/4a6be92))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.12](https://github.com/lobehub/lobe-chat/compare/v2.1.11...v2.1.12)

<sup>Released on **2026-02-03**</sup>

#### 🐛 Bug Fixes

- **changelog**: Normalize versionRange to valid semver.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **changelog**: Normalize versionRange to valid semver, closes [#12049](https://github.com/lobehub/lobe-chat/issues/12049) ([74b9bd0](https://github.com/lobehub/lobe-chat/commit/74b9bd0))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.11](https://github.com/lobehub/lobe-chat/compare/v2.1.10...v2.1.11)

<sup>Released on **2026-02-02**</sup>

#### 🐛 Bug Fixes

- **misc**: Hide password features when AUTH_DISABLE_EMAIL_PASSWORD is set.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **misc**: Hide password features when AUTH_DISABLE_EMAIL_PASSWORD is set, closes [#12023](https://github.com/lobehub/lobe-chat/issues/12023) ([e2fd28e](https://github.com/lobehub/lobe-chat/commit/e2fd28e))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.10](https://github.com/lobehub/lobe-chat/compare/v2.1.9...v2.1.10)

<sup>Released on **2026-02-02**</sup>

#### 🐛 Bug Fixes

- **auth**: Revert authority URL and tenant ID for Microsoft authentication..

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **auth**: Revert authority URL and tenant ID for Microsoft authentication., closes [#11930](https://github.com/lobehub/lobe-chat/issues/11930) ([98f93ef](https://github.com/lobehub/lobe-chat/commit/98f93ef))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.9](https://github.com/lobehub/lobe-chat/compare/v2.1.8...v2.1.9)

<sup>Released on **2026-02-02**</sup>

#### 🐛 Bug Fixes

- **misc**: Use oauth2.link for generic OIDC provider account linking.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **misc**: Use oauth2.link for generic OIDC provider account linking, closes [#12024](https://github.com/lobehub/lobe-chat/issues/12024) ([c7a06a4](https://github.com/lobehub/lobe-chat/commit/c7a06a4))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.8](https://github.com/lobehub/lobe-chat/compare/v2.1.7...v2.1.8)

<sup>Released on **2026-02-01**</sup>

#### 💄 Styles

- **misc**: Improve tasks display.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### Styles

- **misc**: Improve tasks display, closes [#12032](https://github.com/lobehub/lobe-chat/issues/12032) ([3423ad1](https://github.com/lobehub/lobe-chat/commit/3423ad1))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.7](https://github.com/lobehub/lobe-chat/compare/v2.1.6...v2.1.7)

<sup>Released on **2026-02-01**</sup>

#### 🐛 Bug Fixes

- **misc**: Add missing description parameter docs in Notebook system prompt.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **misc**: Add missing description parameter docs in Notebook system prompt, closes [#12015](https://github.com/lobehub/lobe-chat/issues/12015) [#11391](https://github.com/lobehub/lobe-chat/issues/11391) ([182030f](https://github.com/lobehub/lobe-chat/commit/182030f))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.6](https://github.com/lobehub/lobe-chat/compare/v2.1.5...v2.1.6)

<sup>Released on **2026-02-01**</sup>

#### 💄 Styles

- **misc**: Improve local-system tool implement.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### Styles

- **misc**: Improve local-system tool implement, closes [#12022](https://github.com/lobehub/lobe-chat/issues/12022) ([5e203b8](https://github.com/lobehub/lobe-chat/commit/5e203b8))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.5](https://github.com/lobehub/lobe-chat/compare/v2.1.4...v2.1.5)

<sup>Released on **2026-01-31**</sup>

#### 🐛 Bug Fixes

- **misc**: Slove the group member agents cant set skills problem.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **misc**: Slove the group member agents cant set skills problem, closes [#12021](https://github.com/lobehub/lobe-chat/issues/12021) ([2302940](https://github.com/lobehub/lobe-chat/commit/2302940))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.4](https://github.com/lobehub/lobe-chat/compare/v2.1.3...v2.1.4)

<sup>Released on **2026-01-31**</sup>

#### 🐛 Bug Fixes

- **stream**: Update event handling to use 'text' instead of 'content_part' in gemini 2.5 models.

#### 💄 Styles

- **misc**: Update i18n, Update Kimi K2.5 & Qwen3 Max Thinking models.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **stream**: Update event handling to use 'text' instead of 'content_part' in gemini 2.5 models, closes [#11235](https://github.com/lobehub/lobe-chat/issues/11235) ([a76a630](https://github.com/lobehub/lobe-chat/commit/a76a630))

#### Styles

- **misc**: Update i18n, closes [#11920](https://github.com/lobehub/lobe-chat/issues/11920) ([1a590a0](https://github.com/lobehub/lobe-chat/commit/1a590a0))
- **misc**: Update Kimi K2.5 & Qwen3 Max Thinking models, closes [#11925](https://github.com/lobehub/lobe-chat/issues/11925) ([6f9e010](https://github.com/lobehub/lobe-chat/commit/6f9e010))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.3](https://github.com/lobehub/lobe-chat/compare/v2.1.2...v2.1.3)

<sup>Released on **2026-01-31**</sup>

#### 🐛 Bug Fixes

- **auth**: Add AUTH_DISABLE_EMAIL_PASSWORD env to enable SSO-only mode.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **auth**: Add AUTH_DISABLE_EMAIL_PASSWORD env to enable SSO-only mode, closes [#12009](https://github.com/lobehub/lobe-chat/issues/12009) ([f3210a3](https://github.com/lobehub/lobe-chat/commit/f3210a3))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.2](https://github.com/lobehub/lobe-chat/compare/v2.1.1...v2.1.2)

<sup>Released on **2026-01-30**</sup>

#### 🐛 Bug Fixes

- **misc**: Fix feishu sso provider.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **misc**: Fix feishu sso provider, closes [#11970](https://github.com/lobehub/lobe-chat/issues/11970) ([ffd9fff](https://github.com/lobehub/lobe-chat/commit/ffd9fff))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.1.1](https://github.com/lobehub/lobe-chat/compare/v2.1.0...v2.1.1)

<sup>Released on **2026-01-30**</sup>

#### 🐛 Bug Fixes

- **misc**: Correct desktop download URL path.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **misc**: Correct desktop download URL path, closes [#11990](https://github.com/lobehub/lobe-chat/issues/11990) ([e46df98](https://github.com/lobehub/lobe-chat/commit/e46df98))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

## [Version 2.1.0](https://github.com/lobehub/lobe-chat/compare/v2.0.13...v2.1.0)

<sup>Released on **2026-01-30**</sup>

#### ✨ Features

- **misc**: Refactor cron job UI and use runtime enableBusinessFeatures flag.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's improved

- **misc**: Refactor cron job UI and use runtime enableBusinessFeatures flag, closes [#11975](https://github.com/lobehub/lobe-chat/issues/11975) ([104a19a](https://github.com/lobehub/lobe-chat/commit/104a19a))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.0.13](https://github.com/lobehub/lobe-chat/compare/v2.0.12...v2.0.13)

<sup>Released on **2026-01-29**</sup>

#### 💄 Styles

- **misc**: Fix usage table display issues.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### Styles

- **misc**: Fix usage table display issues, closes [#10108](https://github.com/lobehub/lobe-chat/issues/10108) ([4bd82c3](https://github.com/lobehub/lobe-chat/commit/4bd82c3))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.0.12](https://github.com/lobehub/lobe-chat/compare/v2.0.11...v2.0.12)

<sup>Released on **2026-01-29**</sup>

#### 🐛 Bug Fixes

- **misc**: Group publish to market should set local group market identifer.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **misc**: Group publish to market should set local group market identifer, closes [#11965](https://github.com/lobehub/lobe-chat/issues/11965) ([0bda4d9](https://github.com/lobehub/lobe-chat/commit/0bda4d9))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.0.11](https://github.com/lobehub/lobe-chat/compare/v2.0.10...v2.0.11)

<sup>Released on **2026-01-29**</sup>

#### 💄 Styles

- **misc**: Fix group task render.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### Styles

- **misc**: Fix group task render, closes [#11952](https://github.com/lobehub/lobe-chat/issues/11952) ([b8ef02e](https://github.com/lobehub/lobe-chat/commit/b8ef02e))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.0.10](https://github.com/lobehub/lobe-chat/compare/v2.0.9...v2.0.10)

<sup>Released on **2026-01-29**</sup>

#### 🐛 Bug Fixes

- **misc**: Add ExtendParamsTypeSchema for enhanced model settings.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **misc**: Add ExtendParamsTypeSchema for enhanced model settings, closes [#11437](https://github.com/lobehub/lobe-chat/issues/11437) ([f58c980](https://github.com/lobehub/lobe-chat/commit/f58c980))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.0.9](https://github.com/lobehub/lobe-chat/compare/v2.0.8...v2.0.9)

<sup>Released on **2026-01-29**</sup>

#### 🐛 Bug Fixes

- **model-bank**: Fix ZenMux model IDs by adding provider prefixes.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **model-bank**: Fix ZenMux model IDs by adding provider prefixes, closes [#11947](https://github.com/lobehub/lobe-chat/issues/11947) ([17f8a5c](https://github.com/lobehub/lobe-chat/commit/17f8a5c))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.0.8](https://github.com/lobehub/lobe-chat/compare/v2.0.7...v2.0.8)

<sup>Released on **2026-01-28**</sup>

#### 🐛 Bug Fixes

- **misc**: Fix inbox agent in mobile.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **misc**: Fix inbox agent in mobile, closes [#11929](https://github.com/lobehub/lobe-chat/issues/11929) ([42f5c0b](https://github.com/lobehub/lobe-chat/commit/42f5c0b))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.0.7](https://github.com/lobehub/lobe-chat/compare/v2.0.6...v2.0.7)

<sup>Released on **2026-01-28**</sup>

#### 🐛 Bug Fixes

- **model-runtime**: Include tool_calls in speed metrics & add getActiveTraceId.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **model-runtime**: Include tool_calls in speed metrics & add getActiveTraceId, closes [#11927](https://github.com/lobehub/lobe-chat/issues/11927) ([b24da44](https://github.com/lobehub/lobe-chat/commit/b24da44))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.0.6](https://github.com/lobehub/lobe-chat/compare/v2.0.5...v2.0.6)

<sup>Released on **2026-01-27**</sup>

#### 🐛 Bug Fixes

- **misc**: The klavis in onboarding connect timeout fixed.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **misc**: The klavis in onboarding connect timeout fixed, closes [#11918](https://github.com/lobehub/lobe-chat/issues/11918) ([bc165be](https://github.com/lobehub/lobe-chat/commit/bc165be))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.0.5](https://github.com/lobehub/lobe-chat/compare/v2.0.4...v2.0.5)

<sup>Released on **2026-01-27**</sup>

#### 🐛 Bug Fixes

- **misc**: Update the artifact prompt.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **misc**: Update the artifact prompt, closes [#11907](https://github.com/lobehub/lobe-chat/issues/11907) ([217e689](https://github.com/lobehub/lobe-chat/commit/217e689))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.0.4](https://github.com/lobehub/lobe-chat/compare/v2.0.3...v2.0.4)

<sup>Released on **2026-01-27**</sup>

#### 🐛 Bug Fixes

- **misc**: Rename docker image and update docs for v2.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **misc**: Rename docker image and update docs for v2, closes [#11911](https://github.com/lobehub/lobe-chat/issues/11911) ([e6cb6cb](https://github.com/lobehub/lobe-chat/commit/e6cb6cb))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.0.3](https://github.com/lobehub/lobe-chat/compare/v2.0.2...v2.0.3)

<sup>Released on **2026-01-27**</sup>

#### 🐛 Bug Fixes

- **misc**: Fixed compressed group message & open the switch config to control compression config enabled, fixed the onboarding crash problem.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **misc**: Fixed compressed group message & open the switch config to control compression config enabled, closes [#11901](https://github.com/lobehub/lobe-chat/issues/11901) ([dc51838](https://github.com/lobehub/lobe-chat/commit/dc51838))
- **misc**: Fixed the onboarding crash problem, closes [#11905](https://github.com/lobehub/lobe-chat/issues/11905) ([439e4ee](https://github.com/lobehub/lobe-chat/commit/439e4ee))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.0.2](https://github.com/lobehub/lobe-chat/compare/v2.0.1...v2.0.2)

<sup>Released on **2026-01-27**</sup>

#### 🐛 Bug Fixes

- **misc**: Slove the recentTopicLinkError.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **misc**: Slove the recentTopicLinkError, closes [#11896](https://github.com/lobehub/lobe-chat/issues/11896) ([b358413](https://github.com/lobehub/lobe-chat/commit/b358413))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

### [Version 2.0.1](https://github.com/lobehub/lobe-chat/compare/v2.0.0...v2.0.1)

<sup>Released on **2026-01-27**</sup>

#### 🐛 Bug Fixes

- **share**: Shared group topic not show avatar.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### What's fixed

- **share**: Shared group topic not show avatar, closes [#11894](https://github.com/lobehub/lobe-chat/issues/11894) ([80fb496](https://github.com/lobehub/lobe-chat/commit/80fb496))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>



================================================
FILE: CLAUDE.md
================================================
# CLAUDE.md

Guidelines for using Claude Code in this LobeHub repository.

## Tech Stack

- Next.js 16 + React 19 + TypeScript
- SPA inside Next.js with `react-router-dom`
- `@lobehub/ui`, antd for components; antd-style for CSS-in-JS — **prefer `createStaticStyles` with `cssVar.*`** (zero-runtime); only fall back to `createStyles` + `token` when styles genuinely need runtime computation. See `.cursor/docs/createStaticStyles_migration_guide.md`.
- react-i18next for i18n; zustand for state management
- SWR for data fetching; TRPC for type-safe backend
- Drizzle ORM with PostgreSQL; Vitest for testing

## Project Structure

```plaintext
lobehub/
├── apps/desktop/           # Electron desktop app
├── packages/               # Shared packages (@lobechat/*)
│   ├── database/           # Database schemas, models, repositories
│   ├── agent-runtime/      # Agent runtime
│   └── ...
├── src/
│   ├── app/                # Next.js App Router (backend API + auth)
│   │   ├── (backend)/     # API routes (trpc, webapi, etc.)
│   │   ├── spa/            # SPA HTML template service
│   │   └── [variants]/(auth)/  # Auth pages (SSR required)
│   ├── routes/             # SPA page components (Vite)
│   │   ├── (main)/         # Desktop pages
│   │   ├── (mobile)/       # Mobile pages
│   │   ├── (desktop)/      # Desktop-specific pages
│   │   ├── onboarding/     # Onboarding pages
│   │   └── share/          # Share pages
│   ├── spa/                # SPA entry points and router config
│   │   ├── entry.web.tsx   # Web entry
│   │   ├── entry.mobile.tsx
│   │   ├── entry.desktop.tsx
│   │   └── router/         # React Router configuration
│   ├── store/              # Zustand stores
│   ├── services/           # Client services
│   ├── server/             # Server services and routers
│   └── ...
└── e2e/                    # E2E tests (Cucumber + Playwright)
```

## SPA Routes and Features

SPA-related code is grouped under `src/spa/` (entries + router) and `src/routes/` (page segments). We use a **roots vs features** split: route trees only hold page segments; business logic and UI live in features.

- **`src/spa/`** – SPA entry points (`entry.web.tsx`, `entry.mobile.tsx`, `entry.desktop.tsx`) and React Router config (`router/`). Keeps router config next to entries to avoid confusion with `src/routes/`.

- **`src/routes/` (roots)**\
  Only page-segment files: `_layout/index.tsx`, `index.tsx` (or `page.tsx`), and dynamic segments like `[id]/index.tsx`. Keep these **thin**: they should only import from `@/features/*` and compose layout/page, with no business logic or heavy UI.

- **`src/features/`**\
  Business components by **domain** (e.g. `Pages`, `PageEditor`, `Home`). Put layout chunks (sidebar, header, body), hooks, and domain-specific UI here. Each feature exposes an `index.ts` (or `index.tsx`) with clear exports.

When adding or changing SPA routes:

1. In `src/routes/`, add only the route segment files (layout + page) that delegate to features.
2. Implement layout and page content under `src/features/<Domain>/` and export from there.
3. In route files, use `import { X } from '@/features/<Domain>'` (or `import Y from '@/features/<Domain>/...'`). Do not add new `features/` folders inside `src/routes/`.
4. **Register the desktop route tree in both configs:** `src/spa/router/desktopRouter.config.tsx` and `src/spa/router/desktopRouter.config.desktop.tsx` must stay in sync (same paths and nesting). Updating only one can cause **blank screens** if the other build path expects the route.

See the **spa-routes** skill (`.agents/skills/spa-routes/SKILL.md`) for the full convention and file-division rules.

## Development

### Starting the Dev Environment

```bash
# SPA dev mode (frontend only, proxies API to localhost:3010)
bun run dev:spa

# Full-stack dev (Next.js + Vite SPA concurrently)
bun run dev
```

After `dev:spa` starts, the terminal prints a **Debug Proxy** URL:

```plaintext
Debug Proxy: https://app.lobehub.com/_dangerous_local_dev_proxy?debug-host=http%3A%2F%2Flocalhost%3A9876
```

Open this URL to develop locally against the production backend (app.lobehub.com). The proxy page loads your local Vite dev server's SPA into the online environment, enabling HMR with real server config.

### Git Workflow

- **Branch strategy**: `canary` is the development branch (cloud production); `main` is the release branch (periodically cherry-picks from canary)
- New branches should be created from `canary`; PRs should target `canary`
- Use rebase for `git pull`
- Commit messages: prefix with gitmoji
- Branch format: `<type>/<feature-name>`

### Package Management

- `pnpm` for dependency management
- `bun` to run npm scripts
- `bunx` for executable npm packages

### Testing

```bash
# Run specific test (NEVER run `bun run test` - takes ~10 minutes)
bunx vitest run --silent='passed-only' '[file-path]'

# Database package
cd packages/database && bunx vitest run --silent='passed-only' '[file]'
```

- Prefer `vi.spyOn` over `vi.mock`
- Tests must pass type check: `bun run type-check`
- After 2 failed fix attempts, stop and ask for help

### i18n

- Add keys to `src/locales/default/namespace.ts`
- For dev preview: translate `locales/zh-CN/` and `locales/en-US/`
- Don't run `pnpm i18n` - CI handles it

## Skills (Auto-loaded by Claude)

Claude Code automatically loads relevant skills from `.agents/skills/`.



================================================
FILE: CODE_OF_CONDUCT.md
================================================
# Contributor Covenant Code of Conduct

## Our Pledge

We as members, contributors, and leaders pledge to participate in our
community a harassment-free experience for everyone, regardless of age, body
size, visible or invisible disability, ethnicity, sex characteristics, gender
identity and expression, level of experience, education, socio-economic status,
nationality, personal appearance, race, religion, or sexual identity
and orientation.

We pledge to act and interact in ways that contribute to an open, welcoming,
diverse, inclusive, and healthy community.

## Our Standards

Examples of behavior that contributes to a positive environment for our
community includes:

- Demonstrating empathy and kindness toward other people
- Being respectful of differing opinions, viewpoints, and experiences
- Giving and gracefully accepting constructive feedback
- Accepting responsibility and apologizing to those affected by our mistakes,
  and learning from the experience
- Focusing on what is best not just for us as individuals, but for the
  overall community

## Examples of unacceptable behavior include:

- The use of sexualized language or imagery, and sexual attention or
  advances of any kind
- Trolling, insulting or derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information, such as a physical or email
  address, without their explicit permission
- Other conduct that could reasonably be considered inappropriate in a
  professional setting

## Enforcement Responsibilities

Community leaders are responsible for clarifying and enforcing our standards of
acceptable behavior and will take appropriate and fair corrective action in
response to any behavior that they deem inappropriate, threatening, offensive,
or harmful.

Community leaders have the right and responsibility to remove, edit, or reject
comments, commits, code, wiki edits, issues, and other contributions that are
not aligned to this Code of Conduct, and will communicate reasons for moderation
decisions when appropriate.

## Scope

This Code of Conduct applies within all community spaces and also applies when
an individual is officially representing the community in public spaces.
Examples of representing our community include using an official e-mail address,
posting via an official social media account, or acting as an appointed
representative at an online or offline event.

## Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be
reported to the community leaders responsible for enforcement at
.
All complaints will be reviewed and investigated promptly and fairly.

All community leaders are obligated to respect the privacy and security of the
reporter of any incident.

## Enforcement Guidelines

Community leaders will follow these Community Impact Guidelines in determining
the consequences for any action they deem in violation of this Code of Conduct:

### 1. Correction

**Community Impact**: Use of inappropriate language or other behavior deemed
unprofessional or unwelcome in the community.

**Consequence**: A private, written warning from community leaders, providing
clarity around the nature of the violation and an explanation of why the
behavior was inappropriate. A public apology may be requested.

### 2. Warning

**Community Impact**: A violation through a single incident or series
of actions.

**Consequence**: A warning with consequences for continued behavior. No
interaction with the people involved, including unsolicited interaction with
those enforcing the Code of Conduct, for a specified time. This
includes avoiding interactions in community spaces as well as external channels
like social media. Violating these terms may lead to a temporary or
permanent ban.

### 3. Temporary Ban

**Community Impact**: A serious violation of community standards, including
sustained inappropriate behavior.

**Consequence**: A temporary ban from any sort of interaction or public
communication with the community for a specified time. No public or
private interaction with the people involved, including unsolicited interaction
with those enforcing the Code of Conduct, is allowed during this period.
Violating these terms may lead to a permanent ban.

### 4. Permanent Ban

**Community Impact**: Demonstrating a pattern of violation of community
standards, including sustained inappropriate behavior, harassment of an
individual, or aggression toward or disparagement of classes of individuals.

**Consequence**: A permanent ban from any sort of public interaction within
the community.

## Attribution

This Code of Conduct is adapted from the [Contributor Covenant][homepage],
version 2.0, available at
<https://www.contributor-covenant.org/version/2/0/code_of_conduct.html>.

Community Impact Guidelines were inspired by [Mozilla's code of conduct
enforcement ladder](https://github.com/mozilla/diversity).

For answers to common questions about this code of conduct, see the FAQ at
<https://www.contributor-covenant.org/faq>. Translations are available at
<https://www.contributor-covenant.org/translations>.

[homepage]: https://www.contributor-covenant.org



================================================
FILE: codecov.yml
================================================
component_management:
  individual_components:
    # App architecture layers
    - component_id: app_store
      name: 'Store'
      paths:
        - src/store/**
    - component_id: app_services
      name: 'Services'
      paths:
        - src/services/**
    - component_id: app_server
      name: 'Server'
      paths:
        - src/server/**
    - component_id: app_libs
      name: 'Libs'
      paths:
        - src/libs/**
    - component_id: app_utils
      name: 'Utils'
      paths:
        - src/utils/**

coverage:
  status:
    project:
      default: off
      database:
        flags:
          - database
      app:
        flags:
          - app
      threshold: '0.5%'
    patch: off

comment:
  layout: 'header, diff, flags, components' # show component info in the PR comment



================================================
FILE: commitlint.config.mjs
================================================
import { commitlint } from '@lobehub/lint';

export default commitlint;



================================================
FILE: conductor.json
================================================
{
  "scripts": {
    "setup": "bash \"$CONDUCTOR_ROOT_PATH/.conductor/setup.sh\""
  }
}



================================================
FILE: CONTRIBUTING.md
================================================
# LobeHub - Contributing Guide 🌟

We're thrilled that you want to contribute to LobeHub, the future of communication! 😄

LobeHub is an open-source project, and we welcome your collaboration. Before you jump in, let's make sure you're all set to contribute effectively and have loads of fun along the way!

## Table of Contents

- [Fork the Repository](#fork-the-repository)
- [Clone Your Fork](#clone-your-fork)
- [Create a New Branch](#create-a-new-branch)
- [Code Like a Wizard](#code-like-a-wizard)
- [Committing Your Work](#committing-your-work)
- [Sync with Upstream](#sync-with-upstream)
- [Open a Pull Request](#open-a-pull-request)
- [Review and Collaboration](#review-and-collaboration)
- [Celebrate 🎉](#celebrate-)

## Fork the Repository

🍴 Fork this repository to your GitHub account by clicking the "Fork" button at the top right. This creates a personal copy of the project you can work on.

## Clone Your Fork

📦 Clone your forked repository to your local machine using the `git clone` command:

```bash
git clone https://github.com/YourUsername/lobehub.git
```

## Create a New Branch

🌿 Create a new branch for your contribution. This helps keep your work organized and separate from the main codebase.

```bash
git checkout -b your-branch-name
```

Choose a meaningful branch name related to your work. It makes collaboration easier!

## Code Like a Wizard

🧙‍♀️ Time to work your magic! Write your code, fix bugs, or add new features. Be sure to follow our project's coding style. You can check if your code adheres to our style using:

```bash
pnpm lint
```

This adds a bit of enchantment to your coding experience! ✨

## Committing Your Work

📝 Ready to save your progress? Commit your changes to your branch.

```bash
git add .
git commit -m "Your meaningful commit message"
```

Please keep your commits focused and clear. And remember to be kind to your fellow contributors; keep your commits concise.

## Sync with Upstream

⚙️ Periodically, sync your forked repository with the original (upstream) repository to stay up-to-date with the latest changes.

```bash
git remote add upstream https://github.com/lobehub/lobehub.git
git fetch upstream
git merge upstream/main
```

This ensures you're working on the most current version of LobeHub. Stay fresh! 💨

## Open a Pull Request

🚀 Time to share your contribution! Head over to the original LobeHub repository and open a Pull Request (PR). Our maintainers will review your work.

## Review and Collaboration

👓 Your PR will undergo thorough review and testing. The maintainers will provide feedback, and you can collaborate to make your contribution even better. We value teamwork!

## Celebrate 🎉

🎈 Congratulations! Your contribution is now part of LobeHub. 🥳

Thank you for making LobeHub even more magical. We can't wait to see what you create! 🌠

Happy Coding! 🚀🦄



================================================
FILE: Dockerfile
================================================
## Set global build ENV
ARG NODEJS_VERSION="24"

## Base image for all building stages
FROM node:${NODEJS_VERSION}-slim AS base

ARG USE_CN_MIRROR

ENV DEBIAN_FRONTEND="noninteractive"

RUN set -e && \
    if [ "${USE_CN_MIRROR:-false}" = "true" ]; then \
        sed -i "s/deb.debian.org/mirrors.ustc.edu.cn/g" "/etc/apt/sources.list.d/debian.sources"; \
    fi && \
    apt update && \
    apt install ca-certificates proxychains-ng -qy && \
    mkdir -p /distroless/bin /distroless/etc /distroless/etc/ssl/certs /distroless/lib && \
    cp /usr/lib/$(arch)-linux-gnu/libproxychains.so.4 /distroless/lib/libproxychains.so.4 && \
    cp /usr/lib/$(arch)-linux-gnu/libdl.so.2 /distroless/lib/libdl.so.2 && \
    cp /usr/bin/proxychains4 /distroless/bin/proxychains && \
    cp /etc/proxychains4.conf /distroless/etc/proxychains4.conf && \
    cp /usr/lib/$(arch)-linux-gnu/libstdc++.so.6 /distroless/lib/libstdc++.so.6 && \
    cp /usr/lib/$(arch)-linux-gnu/libgcc_s.so.1 /distroless/lib/libgcc_s.so.1 && \
    cp /usr/lib/$(arch)-linux-gnu/librt.so.1 /distroless/lib/librt.so.1 && \
    cp /usr/local/bin/node /distroless/bin/node && \
    cp /etc/ssl/certs/ca-certificates.crt /distroless/etc/ssl/certs/ca-certificates.crt && \
    rm -rf /tmp/* /var/lib/apt/lists/* /var/tmp/*

## Builder image, install all the dependencies and build the app
FROM base AS builder

ARG USE_CN_MIRROR
ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_ANALYTICS_POSTHOG
ARG NEXT_PUBLIC_POSTHOG_HOST
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_ANALYTICS_UMAMI
ARG NEXT_PUBLIC_UMAMI_SCRIPT_URL
ARG NEXT_PUBLIC_UMAMI_WEBSITE_ID
ARG FEATURE_FLAGS

ENV NEXT_PUBLIC_BASE_PATH="${NEXT_PUBLIC_BASE_PATH}" \
    FEATURE_FLAGS="${FEATURE_FLAGS}"

ENV APP_URL="http://app.com" \
    DATABASE_DRIVER="node" \
    DATABASE_URL="postgres://postgres:password@localhost:5432/postgres" \
    KEY_VAULTS_SECRET="use-for-build" \
    AUTH_SECRET="use-for-build"

# Sentry
ENV NEXT_PUBLIC_SENTRY_DSN="${NEXT_PUBLIC_SENTRY_DSN}" \
    SENTRY_ORG="" \
    SENTRY_PROJECT=""

# Posthog
ENV NEXT_PUBLIC_ANALYTICS_POSTHOG="${NEXT_PUBLIC_ANALYTICS_POSTHOG}" \
    NEXT_PUBLIC_POSTHOG_HOST="${NEXT_PUBLIC_POSTHOG_HOST}" \
    NEXT_PUBLIC_POSTHOG_KEY="${NEXT_PUBLIC_POSTHOG_KEY}"

# Umami
ENV NEXT_PUBLIC_ANALYTICS_UMAMI="${NEXT_PUBLIC_ANALYTICS_UMAMI}" \
    NEXT_PUBLIC_UMAMI_SCRIPT_URL="${NEXT_PUBLIC_UMAMI_SCRIPT_URL}" \
    NEXT_PUBLIC_UMAMI_WEBSITE_ID="${NEXT_PUBLIC_UMAMI_WEBSITE_ID}"

# Node
ENV NODE_OPTIONS="--max-old-space-size=8192"

WORKDIR /app

COPY package.json pnpm-workspace.yaml ./
COPY .npmrc ./
COPY packages ./packages
COPY patches ./patches
# bring in desktop workspace manifest so pnpm can resolve it
COPY apps/desktop/src/main/package.json ./apps/desktop/src/main/package.json

RUN set -e && \
    if [ "${USE_CN_MIRROR:-false}" = "true" ]; then \
        export SENTRYCLI_CDNURL="https://npmmirror.com/mirrors/sentry-cli"; \
        npm config set registry "https://registry.npmmirror.com/"; \
        echo 'canvas_binary_host_mirror=https://npmmirror.com/mirrors/canvas' >> .npmrc; \
    fi && \
    export COREPACK_NPM_REGISTRY=$(npm config get registry | sed 's/\/$//') && \
    npm i -g corepack@latest && \
    corepack enable && \
    corepack use $(sed -n 's/.*"packageManager": "\(.*\)".*/\1/p' package.json) && \
    pnpm i && \
    mkdir -p /deps && \
    cd /deps && \
    pnpm init && \
    pnpm add pg drizzle-orm

COPY . .

# Prebuild: env checks (checkDeprecatedAuth, checkRequiredEnvVars, printEnvInfo) then remove desktop-only code
RUN pnpm exec tsx scripts/dockerPrebuild.mts
RUN rm -rf src/app/desktop "src/app/(backend)/trpc/desktop"

# run build standalone for docker version
RUN npm run build:docker

## Application image, copy all the files for production
FROM busybox:latest AS app

COPY --from=base /distroless/ /

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/.next/standalone /app/
COPY --from=builder /app/.next/static /app/.next/static
# Copy SPA assets (Vite build output)
COPY --from=builder /app/public/_spa /app/public/_spa
# Copy database migrations
COPY --from=builder /app/packages/database/migrations /app/migrations
COPY --from=builder /app/scripts/migrateServerDB/docker.cjs /app/docker.cjs
COPY --from=builder /app/scripts/migrateServerDB/errorHint.js /app/errorHint.js

# copy dependencies
COPY --from=builder /deps/node_modules/.pnpm /app/node_modules/.pnpm
COPY --from=builder /deps/node_modules/pg /app/node_modules/pg
COPY --from=builder /deps/node_modules/drizzle-orm /app/node_modules/drizzle-orm

# Copy server launcher and shared scripts
COPY --from=builder /app/scripts/serverLauncher/startServer.js /app/startServer.js
COPY --from=builder /app/scripts/_shared /app/scripts/_shared

RUN set -e && \
    addgroup -S -g 1001 nodejs && \
    adduser -D -G nodejs -H -S -h /app -u 1001 nextjs && \
    chown -R nextjs:nodejs /app /etc/proxychains4.conf

## Production image, copy all the files and run next
FROM scratch

# Copy all the files from app, set the correct permission for prerender cache
COPY --from=app / /

ENV NODE_ENV="production" \
    NODE_OPTIONS="--dns-result-order=ipv4first --use-openssl-ca" \
    NODE_EXTRA_CA_CERTS="" \
    NODE_TLS_REJECT_UNAUTHORIZED="" \
    SSL_CERT_FILE="/etc/ssl/certs/ca-certificates.crt"

# Make the middleware rewrite through local as default
# refs: https://github.com/lobehub/lobehub/issues/5876
ENV MIDDLEWARE_REWRITE_THROUGH_LOCAL="1"

# set hostname to localhost
ENV HOSTNAME="0.0.0.0" \
    PORT="3210"

# General Variables
ENV APP_URL="" \
    API_KEY_SELECT_MODE="" \
    DEFAULT_AGENT_CONFIG="" \
    SYSTEM_AGENT="" \
    FEATURE_FLAGS="" \
    PROXY_URL=""

# Database
ENV KEY_VAULTS_SECRET="" \
    DATABASE_DRIVER="node" \
    DATABASE_URL=""

# Better Auth
ENV AUTH_SECRET="" \
    AUTH_SSO_PROVIDERS="" \
    AUTH_ALLOWED_EMAILS="" \
    AUTH_TRUSTED_ORIGINS="" \
    AUTH_DISABLE_EMAIL_PASSWORD="" \
    AUTH_EMAIL_VERIFICATION="" \
    AUTH_ENABLE_MAGIC_LINK="" \
    # Google
    AUTH_GOOGLE_ID="" \
    AUTH_GOOGLE_SECRET="" \
    # GitHub
    AUTH_GITHUB_ID="" \
    AUTH_GITHUB_SECRET="" \
    # Microsoft
    AUTH_MICROSOFT_ID="" \
    AUTH_MICROSOFT_SECRET="" \
    AUTH_MICROSOFT_AUTHORITY_URL="" \
    AUTH_MICROSOFT_TENANT_ID=""

# Redis
ENV REDIS_URL="" \
    REDIS_PREFIX="" \
    REDIS_TLS=""

# Email
ENV EMAIL_SERVICE_PROVIDER="" \
    SMTP_HOST="" \
    SMTP_PORT="" \
    SMTP_SECURE="" \
    SMTP_USER="" \
    SMTP_PASS="" \
    SMTP_FROM="" \
    RESEND_API_KEY="" \
    RESEND_FROM=""

# S3
ENV NEXT_PUBLIC_S3_DOMAIN="" \
    S3_PUBLIC_DOMAIN="" \
    S3_ACCESS_KEY_ID="" \
    S3_BUCKET="" \
    S3_ENDPOINT="" \
    S3_SECRET_ACCESS_KEY="" \
    S3_ENABLE_PATH_STYLE="" \
    S3_SET_ACL=""

# Model Variables
ENV \
    # AI21
    AI21_API_KEY="" AI21_MODEL_LIST="" \
    # Ai360
    AI360_API_KEY="" AI360_MODEL_LIST="" \
    # AiHubMix
    AIHUBMIX_API_KEY="" AIHUBMIX_MODEL_LIST="" \
    # Anthropic
    ANTHROPIC_API_KEY="" ANTHROPIC_MODEL_LIST="" ANTHROPIC_PROXY_URL="" \
    # Amazon Bedrock
    ENABLED_AWS_BEDROCK="" AWS_ACCESS_KEY_ID="" AWS_SECRET_ACCESS_KEY="" AWS_REGION="" AWS_BEDROCK_MODEL_LIST="" \
    # Azure OpenAI
    AZURE_API_KEY="" AZURE_API_VERSION="" AZURE_ENDPOINT="" AZURE_MODEL_LIST="" \
    # Baichuan
    BAICHUAN_API_KEY="" BAICHUAN_MODEL_LIST="" \
    # Cloudflare
    CLOUDFLARE_API_KEY="" CLOUDFLARE_BASE_URL_OR_ACCOUNT_ID="" CLOUDFLARE_MODEL_LIST="" \
    # Cohere
    COHERE_API_KEY="" COHERE_MODEL_LIST="" COHERE_PROXY_URL="" \
    # ComfyUI
    ENABLED_COMFYUI="" COMFYUI_BASE_URL="" COMFYUI_AUTH_TYPE="" \
    COMFYUI_API_KEY="" COMFYUI_USERNAME="" COMFYUI_PASSWORD="" COMFYUI_CUSTOM_HEADERS="" \
    # DeepSeek
    DEEPSEEK_API_KEY="" DEEPSEEK_MODEL_LIST="" \
    # Fireworks AI
    FIREWORKSAI_API_KEY="" FIREWORKSAI_MODEL_LIST="" \
    # Gitee AI
    GITEE_AI_API_KEY="" GITEE_AI_MODEL_LIST="" \
    # GitHub
    GITHUB_TOKEN="" GITHUB_MODEL_LIST="" \
    # Google
    GOOGLE_API_KEY="" GOOGLE_MODEL_LIST="" GOOGLE_PROXY_URL="" \
    # Vertex AI
    VERTEXAI_CREDENTIALS="" VERTEXAI_PROJECT="" VERTEXAI_LOCATION="" VERTEXAI_MODEL_LIST="" \
    # Groq
    GROQ_API_KEY="" GROQ_MODEL_LIST="" GROQ_PROXY_URL="" \
    # Higress
    HIGRESS_API_KEY="" HIGRESS_MODEL_LIST="" HIGRESS_PROXY_URL="" \
    # HuggingFace
    HUGGINGFACE_API_KEY="" HUGGINGFACE_MODEL_LIST="" HUGGINGFACE_PROXY_URL="" \
    # Hunyuan
    HUNYUAN_API_KEY="" HUNYUAN_MODEL_LIST="" \
    # InternLM
    INTERNLM_API_KEY="" INTERNLM_MODEL_LIST="" \
    # Jina
    JINA_API_KEY="" JINA_MODEL_LIST="" JINA_PROXY_URL="" \
    # Minimax
    MINIMAX_API_KEY="" MINIMAX_MODEL_LIST="" \
    # Mistral
    MISTRAL_API_KEY="" MISTRAL_MODEL_LIST="" \
    # ModelScope
    MODELSCOPE_API_KEY="" MODELSCOPE_MODEL_LIST="" MODELSCOPE_PROXY_URL="" \
    # Moonshot
    MOONSHOT_API_KEY="" MOONSHOT_MODEL_LIST="" MOONSHOT_PROXY_URL="" \
    # Nebius
    NEBIUS_API_KEY="" NEBIUS_MODEL_LIST="" NEBIUS_PROXY_URL="" \
    # NewAPI
    NEWAPI_API_KEY="" NEWAPI_PROXY_URL="" \
    # Novita
    NOVITA_API_KEY="" NOVITA_MODEL_LIST="" \
    # Nvidia NIM
    NVIDIA_API_KEY="" NVIDIA_MODEL_LIST="" NVIDIA_PROXY_URL="" \
    # Ollama
    ENABLED_OLLAMA="" OLLAMA_MODEL_LIST="" OLLAMA_PROXY_URL="" \
    # OpenAI
    ENABLED_OPENAI="" OPENAI_API_KEY="" OPENAI_MODEL_LIST="" OPENAI_PROXY_URL="" \
    # OpenRouter
    OPENROUTER_API_KEY="" OPENROUTER_MODEL_LIST="" \
    # Perplexity
    PERPLEXITY_API_KEY="" PERPLEXITY_MODEL_LIST="" PERPLEXITY_PROXY_URL="" \
    # PPIO
    PPIO_API_KEY="" PPIO_MODEL_LIST="" \
    # Qiniu
    QINIU_API_KEY="" QINIU_MODEL_LIST="" QINIU_PROXY_URL="" \
    # Qwen
    QWEN_API_KEY="" QWEN_MODEL_LIST="" QWEN_PROXY_URL="" \
    # SambaNova
    SAMBANOVA_API_KEY="" SAMBANOVA_MODEL_LIST="" \
    # Search1API
    SEARCH1API_API_KEY="" SEARCH1API_MODEL_LIST="" \
    # SenseNova
    SENSENOVA_API_KEY="" SENSENOVA_MODEL_LIST="" \
    # SiliconCloud
    SILICONCLOUD_API_KEY="" SILICONCLOUD_MODEL_LIST="" SILICONCLOUD_PROXY_URL="" \
    # Spark
    SPARK_API_KEY="" SPARK_MODEL_LIST="" SPARK_PROXY_URL="" SPARK_SEARCH_MODE="" \
    # Stepfun
    STEPFUN_API_KEY="" STEPFUN_MODEL_LIST="" \
    # Taichu
    TAICHU_API_KEY="" TAICHU_MODEL_LIST="" \
    # TogetherAI
    TOGETHERAI_API_KEY="" TOGETHERAI_MODEL_LIST="" \
    # Upstage
    UPSTAGE_API_KEY="" UPSTAGE_MODEL_LIST="" \
    # v0 (Vercel)
    V0_API_KEY="" V0_MODEL_LIST="" \
    # vLLM
    VLLM_API_KEY="" VLLM_MODEL_LIST="" VLLM_PROXY_URL="" \
    # Wenxin
    WENXIN_API_KEY="" WENXIN_MODEL_LIST="" \
    # xAI
    XAI_API_KEY="" XAI_MODEL_LIST="" XAI_PROXY_URL="" \
    # Xinference
    XINFERENCE_API_KEY="" XINFERENCE_MODEL_LIST="" XINFERENCE_PROXY_URL="" \
    # 01.AI
    ZEROONE_API_KEY="" ZEROONE_MODEL_LIST="" \
    # Zhipu
    ZHIPU_API_KEY="" ZHIPU_MODEL_LIST="" \
    # Tencent Cloud
    TENCENT_CLOUD_API_KEY="" TENCENT_CLOUD_MODEL_LIST="" \
    # Infini-AI
    INFINIAI_API_KEY="" INFINIAI_MODEL_LIST="" \
    # 302.AI
    AI302_API_KEY="" AI302_MODEL_LIST="" \
    # FAL
    ENABLED_FAL="" FAL_API_KEY="" FAL_MODEL_LIST="" \
    # BFL
    BFL_API_KEY="" BFL_MODEL_LIST="" \
    # Vercel AI Gateway
    VERCELAIGATEWAY_API_KEY="" VERCELAIGATEWAY_MODEL_LIST="" \
    # Cerebras
    CEREBRAS_API_KEY="" CEREBRAS_MODEL_LIST=""

USER nextjs

EXPOSE 3210/tcp

ENTRYPOINT ["/bin/node"]

CMD ["/app/startServer.js"]



================================================
FILE: drizzle.config.ts
================================================
import * as dotenv from 'dotenv';
import type { Config } from 'drizzle-kit';

// Read the .env file if it exists, or a file specified by the

// dotenv_config_path parameter that's passed to Node.js

dotenv.config();

let connectionString = process.env.DATABASE_URL!;

export default {
  dbCredentials: {
    url: connectionString,
  },
  dialect: 'postgresql',
  out: './packages/database/migrations',

  schema: './packages/database/src/schemas',
  strict: true,
} satisfies Config;



================================================
FILE: eslint.config.mjs
================================================
import { fileURLToPath } from 'node:url';

import { eslint } from '@lobehub/lint';
import { flat as mdxFlat } from 'eslint-plugin-mdx';

const tsconfigRootDir = fileURLToPath(new URL('.', import.meta.url));

export default eslint(
  {
    ignores: [
      // dependencies
      'node_modules',
      // ci
      'coverage',
      '.coverage',
      // test
      'jest*',
      '*.test.ts',
      '*.test.tsx',
      // umi
      '.umi',
      '.umi-production',
      '.umi-test',
      '.dumi/tmp*',
      // production
      'dist',
      'es',
      'lib',
      'logs',
      // misc
      '.next',
      // temporary directories
      'tmp',
      'temp',
      '.temp',
      '.local',
      'docs/.local',
      // cache directories
      '.cache',
      // AI coding tools directories
      '.claude',
      '.serena',
      '.i18nrc.js',
    ],
    next: true,
    react: 'next',
  },
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir,
      },
    },
  },
  // Global rule overrides
  {
    rules: {
      '@eslint-react/hooks-extra/no-direct-set-state-in-use-effect': 0,
      '@eslint-react/jsx-key-before-spread': 0,
      '@eslint-react/naming-convention/ref-name': 0,
      '@eslint-react/naming-convention/use-state': 0,
      '@eslint-react/no-array-index-key': 0,
      '@next/next/no-img-element': 0,
      '@typescript-eslint/no-use-before-define': 0,
      '@typescript-eslint/no-useless-constructor': 0,
      'no-extra-boolean-cast': 0,
      'no-restricted-syntax': 0,
      'react-refresh/only-export-components': 0,
      'react/no-unknown-property': 0,
      'regexp/match-any': 0,
      'unicorn/better-regex': 0,
    },
  },
  // TypeScript files - enforce consistent type imports
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        2,
        {
          fixStyle: 'separate-type-imports',
        },
      ],
    },
  },
  // MDX files
  {
    ...mdxFlat,
    files: ['**/*.mdx'],
    rules: {
      ...mdxFlat.rules,
      '@typescript-eslint/consistent-type-imports': 0,
      '@typescript-eslint/no-unused-vars': 1,
      'mdx/remark': 0,
      'no-undef': 0,
      'react/jsx-no-undef': 0,
      'react/no-unescaped-entities': 0,
    },
  },
  // Store/image and types/generation - disable sorting
  {
    files: ['src/store/image/**/*', 'src/types/generation/**/*'],
    rules: {
      'perfectionist/sort-interfaces': 0,
      'perfectionist/sort-object-types': 0,
      'perfectionist/sort-objects': 0,
    },
  },
  // model-bank aiModels - enforce English-only descriptions
  {
    files: ['packages/model-bank/src/aiModels/**/*'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          message: 'Chinese characters are not allowed in aiModels files. Use English instead.',
          selector: 'Literal[value=/[\\u4e00-\\u9fff]/]',
        },
      ],
    },
  },
  // CLI scripts
  {
    files: ['scripts/**/*'],
    rules: {
      'unicorn/no-process-exit': 0,
      'unicorn/prefer-top-level-await': 0,
    },
  },
  // E2E and test files - allow console.log for debugging
  {
    files: ['e2e/**/*', '**/*.test.ts', '**/*.test.tsx'],
    rules: {
      'no-console': 0,
    },
  },
  // agent-tracing CLI - console output is the primary interface
  {
    files: ['packages/agent-tracing/**/*'],
    rules: {
      'no-console': 0,
    },
  },
  // lobehub-cli - console output is the primary interface
  {
    files: ['apps/cli/**/*'],
    rules: {
      'no-console': 0,
    },
  },
);



================================================
FILE: GEMINI.md
================================================
# GEMINI.md

Please follow instructions @./AGENTS.md



================================================
FILE: index.html
================================================
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="/favicon.ico" />
    <link rel="shortcut icon" href="/favicon-32x32.ico" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <!--SEO_META-->
    <style>
      html body {
        background: #f8f8f8;
      }
      html[data-theme='dark'] body {
        background-color: #000;
      }
      #loading-screen {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: inherit;
        gap: 12px;
      }
      @keyframes loading-draw {
        0% { stroke-dashoffset: 1000; }
        100% { stroke-dashoffset: 0; }
      }
      @keyframes loading-fill {
        30% { fill-opacity: 0.05; }
        100% { fill-opacity: 1; }
      }
      #loading-brand {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #1f1f1f;
      }
      #loading-brand svg path {
        fill: currentcolor;
        fill-opacity: 0;
        stroke: currentcolor;
        stroke-dasharray: 1000;
        stroke-dashoffset: 1000;
        stroke-width: 0.25em;
        animation:
          loading-draw 2s cubic-bezier(0.4, 0, 0.2, 1) infinite,
          loading-fill 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      }
      html[data-theme='dark'] #loading-brand {
        color: #f0f0f0;
      }
    </style>
    <script>
      (function () {
        function supportsImportMaps() {
          return (
            typeof HTMLScriptElement !== 'undefined' &&
            typeof HTMLScriptElement.supports === 'function' &&
            HTMLScriptElement.supports('importmap')
          );
        }

        function supportsCascadeLayers() {
          var el = document.createElement('div');
          el.className = '__layer_test__';
          el.style.position = 'absolute';
          el.style.left = '-99999px';
          el.style.top = '-99999px';

          var style = document.createElement('style');
          style.textContent =
            '@layer a, b;' +
            '@layer a { .__layer_test__ { color: rgb(1, 2, 3); } }' +
            '@layer b { .__layer_test__ { color: rgb(4, 5, 6); } }';

          document.documentElement.append(style);
          document.documentElement.append(el);

          var color = getComputedStyle(el).color;

          el.remove();
          style.remove();

          return color === 'rgb(4, 5, 6)';
        }

        if (!(supportsImportMaps() && supportsCascadeLayers())) {
          window.location.href = '/not-compatible.html';
          return;
        }

        var theme = 'system';
        try {
          theme = localStorage.getItem('theme') || 'system';
        } catch (_) {}
        var systemTheme =
          window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
        var resolvedTheme = theme === 'system' ? systemTheme : theme;
        if (resolvedTheme === 'dark' || resolvedTheme === 'light') {
          document.documentElement.setAttribute('data-theme', resolvedTheme);
        }

        var hl = new URLSearchParams(location.search).get('hl');
        var m = document.cookie.match(/(?:^|;\s*)LOBE_LOCALE=([^;]*)/);
        var cookie = m ? decodeURIComponent(m[1]) : '';
        var locale = hl || cookie || navigator.language || 'en-US';
        if (locale === 'auto') locale = navigator.language || 'en-US';
        if (hl && !cookie) {
          document.cookie =
            'LOBE_LOCALE=' + encodeURIComponent(hl) + ';path=/;max-age=7776000;SameSite=Lax';
        }
        document.documentElement.lang = locale;
        var rtl = ['ar', 'arc', 'dv', 'fa', 'ha', 'he', 'khw', 'ks', 'ku', 'ps', 'ur', 'yi'];
        document.documentElement.dir =
          rtl.indexOf(locale.split('-')[0].toLowerCase()) >= 0 ? 'rtl' : 'ltr';
      })();
    </script>
    <script>
      window.__SERVER_CONFIG__ = undefined; /* SERVER_CONFIG */
    </script>
  </head>

  <body>
    <div id="loading-screen">
      <div id="loading-brand" aria-label="Loading" role="status">
        <svg fill="currentColor" fill-rule="evenodd" height="40" style="flex:none;line-height:1" viewBox="0 0 940 320" xmlns="http://www.w3.org/2000/svg">
          <title>LobeHub</title>
          <path d="M15 240.035V87.172h39.24V205.75h66.192v34.285H15zM183.731 242c-11.759 0-22.196-2.621-31.313-7.862-9.116-5.241-16.317-12.447-21.601-21.619-5.153-9.317-7.729-19.945-7.729-31.883 0-11.937 2.576-22.492 7.729-31.664 5.164-8.963 12.159-15.98 20.982-21.05l.619-.351c9.117-5.241 19.554-7.861 31.313-7.861s22.196 2.62 31.313 7.861c9.248 5.096 16.449 12.229 21.601 21.401 5.153 9.172 7.729 19.727 7.729 31.664 0 11.938-2.576 22.566-7.729 31.883-5.152 9.172-12.353 16.378-21.601 21.619-9.117 5.241-19.554 7.862-31.313 7.862zm0-32.975c4.36 0 8.191-1.092 11.494-3.275 3.436-2.184 6.144-5.387 8.126-9.609 1.982-4.367 2.973-9.536 2.973-15.505 0-5.968-.991-10.991-2.973-15.067-1.906-4.06-4.483-7.177-7.733-9.352l-.393-.257c-3.303-2.184-7.134-3.276-11.494-3.276-4.228 0-8.059 1.092-11.495 3.276-3.303 2.184-6.011 5.387-8.125 9.609-1.982 4.076-2.973 9.099-2.973 15.067 0 5.969.991 11.138 2.973 15.505 2.114 4.222 4.822 7.425 8.125 9.609 3.436 2.183 7.267 3.275 11.495 3.275zM295.508 78l-.001 54.042a34.071 34.071 0 016.541-5.781c6.474-4.367 14.269-6.551 23.385-6.551 9.777 0 18.629 2.475 26.557 7.424 7.872 4.835 14.105 11.684 18.7 20.546l.325.637c4.756 9.026 7.135 19.799 7.135 32.319 0 12.666-2.379 23.585-7.135 32.757-4.624 9.026-10.966 16.087-19.025 21.182-7.928 4.95-16.78 7.425-26.557 7.425-9.644 0-17.704-2.184-24.178-6.551-2.825-1.946-5.336-4.355-7.532-7.226l.001 11.812h-35.87V78h37.654zm21.998 74.684c-4.228 0-8.059 1.092-11.494 3.276-3.303 2.184-6.012 5.387-8.126 9.609-1.982 4.076-2.972 9.099-2.972 15.067 0 5.969.99 11.138 2.972 15.505 2.114 4.222 4.823 7.425 8.126 9.609 3.435 2.183 7.266 3.275 11.494 3.275s7.994-1.092 11.297-3.275c3.435-2.184 6.143-5.387 8.125-9.609 2.114-4.367 3.171-9.536 3.171-15.505 0-5.968-1.057-10.991-3.171-15.067-1.906-4.06-4.483-7.177-7.732-9.352l-.393-.257c-3.303-2.184-7.069-3.276-11.297-3.276zm105.335 38.653l.084.337a27.857 27.857 0 002.057 5.559c2.246 4.222 5.417 7.498 9.513 9.827 4.096 2.184 8.984 3.276 14.665 3.276 5.285 0 9.777-.801 13.477-2.403 3.579-1.632 7.1-4.025 10.564-7.182l.732-.679 19.818 22.711c-5.153 6.26-11.494 11.064-19.025 14.413-7.531 3.203-16.449 4.804-26.755 4.804-12.683 0-23.782-2.621-33.294-7.862-9.381-5.386-16.713-12.665-21.998-21.837-5.153-9.317-7.729-19.872-7.729-31.665 0-11.792 2.51-22.274 7.53-31.446 5.036-9.105 11.902-16.195 20.596-21.268l.61-.351c8.984-5.241 19.091-7.861 30.322-7.861 10.311 0 19.743 2.286 28.294 6.859l.64.347c8.72 4.659 15.656 11.574 20.809 20.746 5.153 9.172 7.729 20.309 7.729 33.411 0 1.294-.052 2.761-.156 4.4l-.042.623-.17 2.353c-.075 1.01-.151 1.973-.227 2.888h-78.044zm21.365-42.147c-4.492 0-8.456 1.092-11.891 3.276-3.303 2.184-5.879 5.314-7.729 9.39a26.04 26.04 0 00-1.117 2.79 30.164 30.164 0 00-1.121 4.499l-.058.354h43.96l-.015-.106c-.401-2.638-1.122-5.055-2.163-7.252l-.246-.503c-1.776-3.774-4.282-6.742-7.519-8.906l-.409-.266c-3.303-2.184-7.2-3.276-11.692-3.276zm111.695-62.018l-.001 57.432h53.51V87.172h39.24v152.863h-39.24v-59.617H555.9l.001 59.617h-39.24V87.172h39.24zM715.766 242c-8.72 0-16.581-1.893-23.583-5.678-6.87-3.785-12.287-9.681-16.251-17.688-3.832-8.153-5.747-18.417-5.747-30.791v-66.168h37.654v59.398c0 9.172 1.519 15.723 4.558 19.654 3.171 3.931 7.597 5.896 13.278 5.896 3.7 0 7.069-.946 10.108-2.839 3.038-1.892 5.483-4.877 7.332-8.953 1.85-4.222 2.775-9.609 2.775-16.16v-56.996h37.654v118.36h-35.871l.004-12.38c-2.642 3.197-5.682 5.868-9.12 8.012-7.002 4.222-14.599 6.333-22.791 6.333zM841.489 78l-.001 54.041a34.1 34.1 0 016.541-5.78c6.474-4.367 14.269-6.551 23.385-6.551 9.777 0 18.629 2.475 26.556 7.424 7.873 4.835 14.106 11.684 18.701 20.546l.325.637c4.756 9.026 7.134 19.799 7.134 32.319 0 12.666-2.378 23.585-7.134 32.757-4.624 9.026-10.966 16.087-19.026 21.182-7.927 4.95-16.779 7.425-26.556 7.425-9.645 0-17.704-2.184-24.178-6.551-2.825-1.946-5.336-4.354-7.531-7.224v11.81h-35.87V78h37.654zm21.998 74.684c-4.228 0-8.059 1.092-11.495 3.276-3.303 2.184-6.011 5.387-8.125 9.609-1.982 4.076-2.973 9.099-2.973 15.067 0 5.969.991 11.138 2.973 15.505 2.114 4.222 4.822 7.425 8.125 9.609 3.436 2.183 7.267 3.275 11.495 3.275 4.228 0 7.993-1.092 11.296-3.275 3.435-2.184 6.144-5.387 8.126-9.609 2.114-4.367 3.171-9.536 3.171-15.505 0-5.968-1.057-10.991-3.171-15.067-1.906-4.06-4.484-7.177-7.733-9.352l-.393-.257c-3.303-2.184-7.068-3.276-11.296-3.276z" />
        </svg>
      </div>
    </div>
    <div id="root" style="height: 100%"></div>

    <!--ANALYTICS_SCRIPTS-->
    <script type="module" src="/src/spa/entry.web.tsx"></script>
  </body>
</html>



================================================
FILE: index.mobile.html
================================================
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="/favicon.ico" />
    <link rel="shortcut icon" href="/favicon-32x32.ico" />
    <!--SEO_META-->
    <style>
      html body {
        background: #f8f8f8;
      }
      html[data-theme='dark'] body {
        background-color: #000;
      }
    </style>
    <script>
      (function(){
        var O=globalThis.Worker;
        globalThis.Worker=function(u,o){
          var h=typeof u==='string'?u:u instanceof URL?u.href:'';
          if(h.startsWith('http')&&!h.startsWith(location.origin)){
            var b=new Blob(['import "'+h+'";'],{type:'application/javascript'});
            return new O(URL.createObjectURL(b),Object.assign({},o,{type:'module'}));
          }return new O(u,o)};
        globalThis.Worker.prototype=O.prototype;
      })();
    </script>
    <script>
      (function () {
        var theme = 'system';
        try {
          theme = localStorage.getItem('theme') || 'system';
        } catch (_) {}
        var systemTheme =
          window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
        var resolvedTheme = theme === 'system' ? systemTheme : theme;
        if (resolvedTheme === 'dark' || resolvedTheme === 'light') {
          document.documentElement.setAttribute('data-theme', resolvedTheme);
        }

        var hl = new URLSearchParams(location.search).get('hl');
        var m = document.cookie.match(/(?:^|;\s*)LOBE_LOCALE=([^;]*)/);
        var cookie = m ? decodeURIComponent(m[1]) : '';
        var locale = hl || cookie || navigator.language || 'en-US';
        if (locale === 'auto') locale = navigator.language || 'en-US';
        if (hl && !cookie) {
          document.cookie =
            'LOBE_LOCALE=' + encodeURIComponent(hl) + ';path=/;max-age=7776000;SameSite=Lax';
        }
        document.documentElement.lang = locale;
        var rtl = ['ar', 'arc', 'dv', 'fa', 'ha', 'he', 'khw', 'ks', 'ku', 'ps', 'ur', 'yi'];
        document.documentElement.dir =
          rtl.indexOf(locale.split('-')[0].toLowerCase()) >= 0 ? 'rtl' : 'ltr';
      })();
    </script>
    <script>
      window.__SERVER_CONFIG__ = undefined; /* SERVER_CONFIG */
    </script>
  </head>

  <body>
    <div id="root" style="height: 100%"></div>

    <!--ANALYTICS_SCRIPTS-->
    <script type="module" src="/src/spa/entry.mobile.tsx"></script>
  </body>
</html>



================================================
FILE: knip.ts
================================================
import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['src/app/**/*.ts{x,}'],
  ignore: [
    // Test files
    'src/**/__tests__/**',
    'src/**/*.test.ts{x,}',
    'src/**/*.spec.ts{x,}',
    // Other directories
    'packages/**',
    'e2e/**',
    'scripts/**',
    // Config files
    '*.config.{js,ts,mjs,cjs}',
    'next-env.d.ts',
  ],
  ignoreDependencies: [],
  ignoreExportsUsedInFile: true,
  project: ['src/**/*.ts{x,}'],
};

export default config;



================================================
FILE: LICENSE
================================================
LobeHub Community License

Copyright (c) 2024/06/17 - current LobeHub LLC. All rights reserved.

----------

From 1.0, LobeChat is licensed under the LobeHub Community License, based on Apache License 2.0 with the following additional conditions:

1. The commercial usage of LobeChat:

  a. LobeChat may be utilized commercially, including as a frontend and backend service without modifying the source code.

  b. a commercial license must be obtained from the producer if you want to develop and distribute a derivative work based on LobeChat.

Please contact hello@lobehub.com by email to inquire about licensing matters.


2. As a contributor, you should agree that:

  a. The producer can adjust the open-source agreement to be more strict or relaxed as deemed necessary.

  b. Your contributed code may be used for commercial purposes, including but not limited to its cloud edition.

Apart from the specific conditions mentioned above, all other rights and restrictions follow the Apache License 2.0. Detailed information about the Apache License 2.0 can be found at http://www.apache.org/licenses/LICENSE-2.0.



================================================
FILE: netlify.toml
================================================
[build]
command = "rm -rf .next node_modules/.cache && pnpm run build"
publish = ".next"

[build.environment]
NODE_OPTIONS = "--max-old-space-size=4096"

[template.environment]
OPENAI_API_KEY = "set your OpenAI API Key"



================================================
FILE: next.config.ts
================================================
import { defineConfig } from './src/libs/next/config/define-config';

const isVercel = !!process.env.VERCEL_ENV;

const vercelConfig = {
  // Vercel serverless optimization: exclude musl binaries from all routes
  // Vercel uses Amazon Linux (glibc), not Alpine Linux (musl)
  // This saves ~45MB (29MB canvas-musl + 16MB sharp-musl) per serverless function
  outputFileTracingExcludes: {
    '*': [
      'node_modules/.pnpm/@napi-rs+canvas-*-musl*',
      'node_modules/.pnpm/@img+sharp-libvips-*musl*',
      // Exclude SPA/desktop/mobile build artifacts from serverless functions
      'public/_spa/**',
      'dist/desktop/**',
      'dist/mobile/**',
      'apps/desktop/**',
      'packages/database/migrations/**',
    ],
  },
};
const nextConfig = defineConfig({
  ...(isVercel ? vercelConfig : {}),
});

export default nextConfig;



================================================
FILE: package.json
================================================
{
  "name": "@lobehub/lobehub",
  "version": "2.1.51",
  "description": "LobeHub - an open-source,comprehensive AI Agent framework that supports speech synthesis, multimodal, and extensible Function Call plugin system. Supports one-click free deployment of your private ChatGPT/LLM web application.",
  "keywords": [
    "framework",
    "chatbot",
    "chatgpt",
    "nextjs",
    "vercel-ai",
    "openai",
    "azure-openai",
    "visual-model",
    "tts",
    "stt"
  ],
  "homepage": "https://github.com/lobehub/lobehub",
  "bugs": {
    "url": "https://github.com/lobehub/lobehub/issues/new/choose"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/lobehub/lobehub.git"
  },
  "license": "MIT",
  "author": "LobeHub <i@lobehub.com>",
  "sideEffects": [
    "./src/initialize.ts"
  ],
  "workspaces": [
    "packages/*",
    "packages/business/*",
    "e2e",
    "apps/desktop/src/main"
  ],
  "scripts": {
    "build": "bun run build:spa && bun run build:spa:copy && bun run build:next",
    "build:analyze": "cross-env NODE_OPTIONS=--max-old-space-size=81920 next experimental-analyze",
    "build:docker": "pnpm run build:spa && pnpm run build:spa:mobile && pnpm run build:spa:copy && cross-env NODE_OPTIONS=--max-old-space-size=8192 DOCKER=true next build && pnpm run build-sitemap",
    "build:next": "cross-env NODE_OPTIONS=--max-old-space-size=7168 bun run build:next:raw",
    "build:next:raw": "next build",
    "build:raw": "bun run build:spa:raw && bun run build:spa:copy && bun run build:next:raw",
    "build:spa": "cross-env NODE_OPTIONS=--max-old-space-size=8192 pnpm run build:spa:raw",
    "build:spa:copy": "tsx scripts/copySpaBuild.mts && tsx scripts/generateSpaTemplates.mts",
    "build:spa:mobile": "cross-env NODE_OPTIONS=--max-old-space-size=8192 MOBILE=true vite build",
    "build:spa:raw": "rm -rf public/_spa && vite build",
    "build:vercel": "cross-env-shell NODE_OPTIONS=--max-old-space-size=8192 \"bun run build:raw && bun run db:migrate\"",
    "build-migrate-db": "bun run db:migrate",
    "build-sitemap": "tsx ./scripts/buildSitemapIndex/index.ts",
    "clean:node_modules": "bash -lc 'set -e; echo \"Removing all node_modules...\"; rm -rf node_modules; pnpm -r exec rm -rf node_modules; rm -rf apps/desktop/node_modules; echo \"All node_modules removed.\"'",
    "db:generate": "drizzle-kit generate && npm run workflow:dbml",
    "db:migrate": "cross-env MIGRATION_DB=1 tsx ./scripts/migrateServerDB/index.ts",
    "db:studio": "drizzle-kit studio",
    "db:visualize": "dbdocs build docs/development/database-schema.dbml --project lobe-chat",
    "desktop:build:all": "npm run desktop:build:main",
    "desktop:build:main": "npm run build:main --prefix=./apps/desktop",
    "desktop:build-channel": "tsx scripts/electronWorkflow/buildDesktopChannel.ts",
    "desktop:main:build": "npm run desktop:main:build --prefix=./apps/desktop",
    "desktop:package:app": "npm run desktop:build:all && npm run desktop:package:app:platform",
    "desktop:package:app:platform": "tsx scripts/electronWorkflow/buildElectron.ts",
    "desktop:package:local": "npm run desktop:build:all && npm run package:local --prefix=./apps/desktop",
    "desktop:package:local:reuse": "npm run package:local:reuse --prefix=./apps/desktop",
    "dev": "tsx scripts/devStartupSequence.mts",
    "dev:bun": "bun --bun next dev -p 3010",
    "dev:desktop": "cd apps/desktop && pnpm run dev",
    "dev:docker": "docker compose -f docker-compose/dev/docker-compose.yml up -d --wait postgresql redis rustfs searxng",
    "dev:docker:down": "docker compose -f docker-compose/dev/docker-compose.yml down",
    "dev:docker:reset": "docker compose -f docker-compose/dev/docker-compose.yml down -v && rm -rf docker-compose/dev/data && npm run dev:docker && pnpm db:migrate",
    "dev:next": "next dev -p 3010",
    "dev:spa": "vite --port 9876",
    "dev:spa:mobile": "cross-env MOBILE=true vite --port 3012",
    "docs:cdn": "npm run workflow:docs-cdn && npm run lint:mdx",
    "docs:i18n": "lobe-i18n md && npm run lint:mdx",
    "docs:seo": "lobe-seo && npm run lint:mdx",
    "e2e": "cd e2e && npm run test",
    "e2e:install": "playwright install",
    "e2e:ui": "playwright test --ui",
    "hotfix:branch": "tsx ./scripts/hotfixWorkflow/index.ts",
    "i18n": "npm run workflow:i18n && lobe-i18n && prettier -c --write \"locales/**\"",
    "i18n:unused": "tsx ./scripts/i18nWorkflow/analyzeUnusedKeys.ts",
    "i18n:unused-clean": "tsx ./scripts/i18nWorkflow/cleanUnusedKeys.ts",
    "lint": "npm run lint:ts && npm run lint:style && npm run type-check && npm run lint:circular",
    "lint:circular": "npm run lint:circular:main && npm run lint:circular:packages",
    "lint:circular:main": "dpdm src/**/*.ts  --no-warning --no-tree --exit-code circular:1 --no-progress -T true --skip-dynamic-imports circular",
    "lint:circular:packages": "dpdm packages/**/src/**/*.ts  --no-warning --no-tree --exit-code circular:1 --no-progress -T true --skip-dynamic-imports circular",
    "lint:console": "tsx scripts/checkConsoleLog.mts",
    "lint:md": "remark . --silent --output",
    "lint:mdx": "npm run workflow:mdx && remark \"docs/**/*.mdx\" -r ./.remarkrc.mdx.mjs --silent --output && eslint \"docs/**/*.mdx\" --quiet --fix",
    "lint:style": "stylelint \"{src,tests}/**/*.{js,jsx,ts,tsx}\" --fix",
    "lint:ts": "eslint src/ tests/ --concurrency=auto",
    "lint:unused": "knip --include files,exports,types,enumMembers,duplicates",
    "prepare": "husky",
    "prettier": "prettier -c --write \"**/**\"",
    "pull": "git pull",
    "qstash": "pnpx @upstash/qstash-cli@latest dev",
    "reinstall": "rm -rf .next && rm -rf node_modules && rm -rf ./packages/*/node_modules && pnpm -r exec rm -rf node_modules && pnpm install",
    "reinstall:desktop": "rm -rf pnpm-lock.yaml && rm -rf node_modules && pnpm -r exec rm -rf node_modules && pnpm install --node-linker=hoisted",
    "release": "semantic-release",
    "release:branch": "tsx ./scripts/releaseWorkflow/index.ts",
    "self-hosting:docker": "docker build -t lobehub:local .",
    "self-hosting:docker-cn": "docker build -t lobehub-local --build-arg USE_CN_MIRROR=true .",
    "start": "next start -p 3210",
    "stylelint": "stylelint \"src/**/*.{js,jsx,ts,tsx}\" --fix",
    "test": "npm run test-app && npm run test-server",
    "test:e2e": "pnpm --filter @lobechat/e2e-tests test",
    "test:e2e:smoke": "pnpm --filter @lobechat/e2e-tests test:smoke",
    "test:update": "vitest -u",
    "test-app": "vitest run",
    "test-app:coverage": "vitest --coverage --silent='passed-only'",
    "tunnel:cloudflare": "cloudflared tunnel --url http://localhost:3010 --protocol http2",
    "tunnel:ngrok": "ngrok http http://localhost:3010",
    "type-check": "tsgo --noEmit",
    "type-check:tsc": "tsc --noEmit",
    "workflow:cdn": "tsx ./scripts/cdnWorkflow/index.ts",
    "workflow:changelog": "tsx ./scripts/changelogWorkflow/index.ts",
    "workflow:changelog:gen": "tsx ./scripts/changelogWorkflow/generateChangelog.ts",
    "workflow:countCharters": "tsx scripts/countEnWord.ts",
    "workflow:dbml": "tsx ./scripts/dbmlWorkflow/index.ts",
    "workflow:docs": "tsx ./scripts/docsWorkflow/index.ts",
    "workflow:docs-cdn": "tsx ./scripts/docsWorkflow/autoCDN.ts",
    "workflow:i18n": "tsx ./scripts/i18nWorkflow/index.ts",
    "workflow:mdx": "tsx ./scripts/mdxWorkflow/index.ts",
    "workflow:mobile-spa": "tsx scripts/mobileSpaWorkflow/index.ts",
    "workflow:readme": "tsx ./scripts/readmeWorkflow/index.ts",
    "workflow:set-desktop-version": "tsx ./scripts/electronWorkflow/setDesktopVersion.ts"
  },
  "lint-staged": {
    "*.md": [
      "remark --silent --output --",
      "prettier --write --no-error-on-unmatched-pattern"
    ],
    "*.mdx": [
      "remark -r ./.remarkrc.mdx.mjs --silent --output --",
      "eslint --quiet --fix"
    ],
    "*.json": [
      "prettier --write --no-error-on-unmatched-pattern"
    ],
    "*.{mjs,cjs}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{js,jsx}": [
      "eslint --fix",
      "stylelint --fix",
      "prettier --write"
    ],
    "*.{ts,tsx}": [
      "stylelint --fix",
      "eslint --fix",
      "prettier --parser=typescript --write"
    ],
    "*.{yml,yaml}": [
      "eslint --fix"
    ]
  },
  "overrides": {
    "@types/react": "19.2.13",
    "better-auth": "1.4.6",
    "better-call": "1.1.8",
    "drizzle-orm": "^0.45.1",
    "fast-xml-parser": "5.4.2",
    "lexical": "0.42.0",
    "pdfjs-dist": "5.4.530",
    "stylelint-config-clean-order": "7.0.0"
  },
  "dependencies": {
    "@ant-design/icons": "^6.1.0",
    "@ant-design/pro-components": "^2.8.10",
    "@anthropic-ai/sdk": "^0.73.0",
    "@atlaskit/pragmatic-drag-and-drop": "^1.7.7",
    "@atlaskit/pragmatic-drag-and-drop-hitbox": "^1.1.0",
    "@aws-sdk/client-bedrock-runtime": "^3.941.0",
    "@aws-sdk/client-s3": "~3.932.0",
    "@aws-sdk/s3-request-presigner": "~3.932.0",
    "@azure-rest/ai-inference": "1.0.0-beta.5",
    "@azure/core-auth": "^1.10.1",
    "@better-auth/expo": "1.4.6",
    "@better-auth/passkey": "1.4.6",
    "@cfworker/json-schema": "^4.1.1",
    "@chat-adapter/discord": "^4.23.0",
    "@chat-adapter/slack": "^4.23.0",
    "@chat-adapter/state-ioredis": "^4.23.0",
    "@chat-adapter/telegram": "^4.23.0",
    "@codesandbox/sandpack-react": "^2.20.0",
    "@discordjs/rest": "^2.6.0",
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@emoji-mart/data": "^1.2.1",
    "@emoji-mart/react": "^1.1.1",
    "@emotion/react": "^11.14.0",
    "@fal-ai/client": "^1.8.4",
    "@floating-ui/react": "^0.27.19",
    "@formkit/auto-animate": "^0.9.0",
    "@google/genai": "^1.38.0",
    "@henrygd/queue": "^1.2.0",
    "@huggingface/inference": "^4.13.10",
    "@icons-pack/react-simple-icons": "^13.8.0",
    "@khmyznikov/pwa-install": "0.3.9",
    "@larksuiteoapi/node-sdk": "^1.60.0",
    "@lexical/utils": "^0.42.0",
    "@lobechat/agent-gateway-client": "workspace:*",
    "@lobechat/agent-runtime": "workspace:*",
    "@lobechat/agent-templates": "workspace:*",
    "@lobechat/builtin-agents": "workspace:*",
    "@lobechat/builtin-skills": "workspace:*",
    "@lobechat/builtin-tool-activator": "workspace:*",
    "@lobechat/builtin-tool-agent-builder": "workspace:*",
    "@lobechat/builtin-tool-agent-documents": "workspace:*",
    "@lobechat/builtin-tool-agent-management": "workspace:*",
    "@lobechat/builtin-tool-brief": "workspace:*",
    "@lobechat/builtin-tool-calculator": "workspace:*",
    "@lobechat/builtin-tool-claude-code": "workspace:*",
    "@lobechat/builtin-tool-cloud-sandbox": "workspace:*",
    "@lobechat/builtin-tool-creds": "workspace:*",
    "@lobechat/builtin-tool-cron": "workspace:*",
    "@lobechat/builtin-tool-group-agent-builder": "workspace:*",
    "@lobechat/builtin-tool-group-management": "workspace:*",
    "@lobechat/builtin-tool-gtd": "workspace:*",
    "@lobechat/builtin-tool-knowledge-base": "workspace:*",
    "@lobechat/builtin-tool-local-system": "workspace:*",
    "@lobechat/builtin-tool-memory": "workspace:*",
    "@lobechat/builtin-tool-message": "workspace:*",
    "@lobechat/builtin-tool-notebook": "workspace:*",
    "@lobechat/builtin-tool-page-agent": "workspace:*",
    "@lobechat/builtin-tool-remote-device": "workspace:*",
    "@lobechat/builtin-tool-skill-store": "workspace:*",
    "@lobechat/builtin-tool-skills": "workspace:*",
    "@lobechat/builtin-tool-task": "workspace:*",
    "@lobechat/builtin-tool-topic-reference": "workspace:*",
    "@lobechat/builtin-tool-user-interaction": "workspace:*",
    "@lobechat/builtin-tool-web-browsing": "workspace:*",
    "@lobechat/builtin-tool-web-onboarding": "workspace:*",
    "@lobechat/builtin-tools": "workspace:*",
    "@lobechat/business-config": "workspace:*",
    "@lobechat/business-const": "workspace:*",
    "@lobechat/business-model-runtime": "workspace:*",
    "@lobechat/chat-adapter-feishu": "workspace:*",
    "@lobechat/chat-adapter-qq": "workspace:*",
    "@lobechat/chat-adapter-wechat": "workspace:*",
    "@lobechat/config": "workspace:*",
    "@lobechat/const": "workspace:*",
    "@lobechat/context-engine": "workspace:*",
    "@lobechat/conversation-flow": "workspace:*",
    "@lobechat/database": "workspace:*",
    "@lobechat/desktop-bridge": "workspace:*",
    "@lobechat/device-gateway-client": "workspace:*",
    "@lobechat/edge-config": "workspace:*",
    "@lobechat/editor-runtime": "workspace:*",
    "@lobechat/electron-client-ipc": "workspace:*",
    "@lobechat/electron-server-ipc": "workspace:*",
    "@lobechat/eval-dataset-parser": "workspace:*",
    "@lobechat/eval-rubric": "workspace:*",
    "@lobechat/fetch-sse": "workspace:*",
    "@lobechat/file-loaders": "workspace:*",
    "@lobechat/heterogeneous-agents": "workspace:*",
    "@lobechat/local-file-shell": "workspace:*",
    "@lobechat/markdown-patch": "workspace:*",
    "@lobechat/memory-user-memory": "workspace:*",
    "@lobechat/model-runtime": "workspace:*",
    "@lobechat/observability-otel": "workspace:*",
    "@lobechat/openapi": "workspace:*",
    "@lobechat/prompts": "workspace:*",
    "@lobechat/python-interpreter": "workspace:*",
    "@lobechat/shared-tool-ui": "workspace:*",
    "@lobechat/ssrf-safe-fetch": "workspace:*",
    "@lobechat/utils": "workspace:*",
    "@lobechat/web-crawler": "workspace:*",
    "@lobehub/analytics": "^1.6.2",
    "@lobehub/charts": "^5.0.0",
    "@lobehub/desktop-ipc-typings": "workspace:*",
    "@lobehub/editor": "^4.8.1",
    "@lobehub/icons": "^5.0.0",
    "@lobehub/market-sdk": "0.32.2",
    "@lobehub/tts": "^5.1.2",
    "@lobehub/ui": "^5.9.0",
    "@modelcontextprotocol/sdk": "^1.26.0",
    "@napi-rs/canvas": "^0.1.88",
    "@neondatabase/serverless": "^1.0.2",
    "@next/third-parties": "^16.1.5",
    "@opentelemetry/auto-instrumentations-node": "^0.67.0",
    "@opentelemetry/exporter-jaeger": "^2.5.0",
    "@opentelemetry/resources": "^2.2.0",
    "@opentelemetry/sdk-metrics": "^2.2.0",
    "@opentelemetry/winston-transport": "^0.19.0",
    "@react-pdf/renderer": "4.4.1",
    "@react-three/drei": "^10.7.7",
    "@react-three/fiber": "^9.5.0",
    "@saintno/comfyui-sdk": "^0.2.49",
    "@t3-oss/env-core": "^0.13.10",
    "@t3-oss/env-nextjs": "^0.13.10",
    "@tanstack/react-query": "^5.90.20",
    "@trpc/client": "^11.8.1",
    "@trpc/next": "^11.8.1",
    "@trpc/react-query": "^11.8.1",
    "@trpc/server": "^11.8.1",
    "@upstash/qstash": "^2.8.4",
    "@upstash/workflow": "^0.2.23",
    "@vercel/analytics": "^1.6.1",
    "@vercel/edge-config": "^1.4.3",
    "@vercel/functions": "^3.3.6",
    "@vercel/speed-insights": "^1.3.1",
    "@virtuoso.dev/masonry": "^1.4.0",
    "@xterm/xterm": "^5.5.0",
    "@zumer/snapdom": "^1.9.14",
    "ahooks": "^3.9.6",
    "antd": "^6.2.1",
    "antd-style": "4.1.0",
    "async-retry": "^1.3.3",
    "bcryptjs": "^3.0.3",
    "better-auth": "1.4.6",
    "better-auth-harmony": "^1.2.5",
    "better-call": "1.1.8",
    "brotli-wasm": "^3.0.1",
    "buffer": "^6.0.3",
    "chat": "^4.23.0",
    "chroma-js": "^3.2.0",
    "class-variance-authority": "^0.7.1",
    "cmdk": "^1.1.1",
    "cookie": "^1.1.1",
    "countries-and-timezones": "^3.8.0",
    "d3-dsv": "^3.0.1",
    "dayjs": "^1.11.19",
    "debug": "^4.4.3",
    "dexie": "^3.2.7",
    "diff": "^8.0.3",
    "discord-api-types": "^0.38.40",
    "drizzle-orm": "^0.45.1",
    "drizzle-zod": "^0.5.1",
    "epub2": "^3.0.2",
    "es-toolkit": "^1.44.0",
    "fast-deep-equal": "^3.1.3",
    "fflate": "^0.8.2",
    "ffmpeg-static": "^5.3.0",
    "file-type": "^21.3.0",
    "fuse.js": "^7.0.0",
    "gray-matter": "^4.0.3",
    "hono": "^4.11.1",
    "html-to-text": "^9.0.5",
    "i18next": "^25.8.0",
    "i18next-browser-languagedetector": "^8.2.0",
    "i18next-resources-to-backend": "^1.2.1",
    "immer": "^11.1.3",
    "ioredis": "^5.9.2",
    "jose": "^6.1.3",
    "js-sha256": "^0.11.1",
    "jsondiffpatch": "^0.7.3",
    "jsonl-parse-stringify": "^1.0.3",
    "klavis": "^2.15.0",
    "langfuse": "^3.38.6",
    "langfuse-core": "^3.38.6",
    "lexical": "0.42.0",
    "lucide-react": "^1.8.0",
    "mammoth": "^1.11.0",
    "marked": "^17.0.1",
    "mdast-util-to-markdown": "^2.1.2",
    "model-bank": "workspace:*",
    "motion": "^12.29.0",
    "nanoid": "^5.1.6",
    "next": "^16.1.5",
    "next-mdx-remote": "^6.0.0",
    "next-themes": "^0.4.6",
    "nextjs-toploader": "^3.9.17",
    "node-machine-id": "^1.1.12",
    "nodemailer": "^8.0.4",
    "numeral": "^2.0.6",
    "nuqs": "^2.8.6",
    "officeparser": "5.1.1",
    "ogl": "^1.0.11",
    "oidc-provider": "^9.6.0",
    "ollama": "^0.6.3",
    "openai": "^4.104.0",
    "openapi-fetch": "^0.14.1",
    "partial-json": "^0.1.7",
    "path-browserify-esm": "^1.0.6",
    "pathe": "^2.0.3",
    "pdf-parse": "^1.1.4",
    "pdfjs-dist": "5.4.530",
    "pdfkit": "^0.17.2",
    "pg": "^8.17.2",
    "plaiceholder": "^3.0.0",
    "polished": "^4.3.1",
    "posthog-js": "~1.278.0",
    "pure-rand": "^7.0.1",
    "pwa-install-handler": "^2.6.3",
    "query-string": "^9.3.1",
    "random-words": "^2.0.1",
    "rc-util": "^5.44.4",
    "react": "^19.2.3",
    "react-confetti": "^6.4.0",
    "react-dom": "^19.2.3",
    "react-fast-marquee": "^1.6.5",
    "react-hotkeys-hook": "^5.2.3",
    "react-i18next": "^16.5.3",
    "react-lazy-load": "^4.0.1",
    "react-markdown": "^10.1.0",
    "react-pdf": "^10.3.0",
    "react-responsive": "^10.0.1",
    "react-rnd": "^10.5.2",
    "react-router-dom": "^7.13.0",
    "react-scan": "^0.5.3",
    "react-virtuoso": "^4.18.1",
    "react-wrap-balancer": "^1.1.1",
    "remark": "^15.0.1",
    "remark-gfm": "^4.0.1",
    "remark-html": "^16.0.1",
    "remove-markdown": "^0.6.3",
    "resend": "6.8.0",
    "resolve-accept-language": "^3.1.15",
    "rtl-detect": "^1.1.2",
    "semver": "^7.7.3",
    "sharp": "^0.34.5",
    "shiki": "^3.21.0",
    "stripe": "^17.7.0",
    "superjson": "^2.2.6",
    "svix": "^1.84.1",
    "swr": "^2.3.8",
    "three": "^0.181.2",
    "tokenx": "^1.3.0",
    "ts-md5": "^2.0.1",
    "ua-parser-js": "^1.0.41",
    "undici": "^7.19.1",
    "unist-builder": "^4.0.0",
    "url-join": "^5.0.0",
    "use-merge-value": "^1.2.0",
    "uuid": "^13.0.0",
    "virtua": "^0.48.3",
    "word-extractor": "^1.0.4",
    "ws": "^8.19.0",
    "xast-util-to-xml": "^4.0.0",
    "xastscript": "^4.0.0",
    "yaml": "^2.8.2",
    "zod": "^3.25.76",
    "zod-to-json-schema": "^3.25.1",
    "zustand": "5.0.4",
    "zustand-utils": "^2.1.1"
  },
  "devDependencies": {
    "@commitlint/cli": "^19.8.1",
    "@edge-runtime/vm": "^5.0.0",
    "@huggingface/tasks": "^0.19.80",
    "@inquirer/prompts": "^8.2.0",
    "@lobechat/agent-tracing": "workspace:*",
    "@lobechat/types": "workspace:*",
    "@lobehub/i18n-cli": "^1.26.0",
    "@lobehub/lint": "2.1.5",
    "@lobehub/market-types": "^1.12.3",
    "@lobehub/seo-cli": "^1.7.0",
    "@peculiar/webcrypto": "^1.5.0",
    "@playwright/test": "^1.58.0",
    "@prettier/sync": "^0.6.1",
    "@semantic-release/exec": "^6.0.3",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^14.6.1",
    "@types/async-retry": "^1.4.9",
    "@types/chroma-js": "^3.1.2",
    "@types/crypto-js": "^4.2.2",
    "@types/d3-dsv": "^3.0.7",
    "@types/debug": "^4.1.12",
    "@types/fs-extra": "^11.0.4",
    "@types/html-to-text": "^9.0.4",
    "@types/ip": "^1.1.3",
    "@types/json-schema": "^7.0.15",
    "@types/node": "^24.10.9",
    "@types/nodemailer": "^7.0.5",
    "@types/numeral": "^2.0.5",
    "@types/oidc-provider": "^9.5.0",
    "@types/pdf-parse": "^1.1.4",
    "@types/pdfkit": "^0.17.4",
    "@types/pg": "^8.16.0",
    "@types/react": "19.2.13",
    "@types/react-dom": "^19.2.3",
    "@types/rtl-detect": "^1.0.3",
    "@types/semver": "^7.7.1",
    "@types/three": "^0.181.0",
    "@types/ua-parser-js": "^0.7.39",
    "@types/unist": "^3.0.3",
    "@types/ws": "^8.18.1",
    "@types/xast": "^2.0.4",
    "@typescript/native-preview": "7.0.0-dev.20260207.1",
    "@vitejs/plugin-react": "^5.1.4",
    "@vitest/coverage-v8": "^3.2.4",
    "ajv": "^8.17.1",
    "ajv-keywords": "^5.1.0",
    "code-inspector-plugin": "1.3.3",
    "commitlint": "^19.8.1",
    "consola": "^3.4.2",
    "cross-env": "^10.1.0",
    "crypto-js": "^4.2.0",
    "dbdocs": "^0.16.2",
    "dotenv": "^17.2.3",
    "dotenv-expand": "^12.0.3",
    "dpdm-fast": "^1.0.14",
    "drizzle-dbml-generator": "^0.10.0",
    "drizzle-kit": "^0.31.8",
    "eslint": "10.0.2",
    "eslint-plugin-mdx": "^3.7.0",
    "fake-indexeddb": "^6.2.5",
    "fs-extra": "^11.3.3",
    "glob": "^13.0.0",
    "happy-dom": "^20.3.7",
    "husky": "^9.1.7",
    "import-in-the-middle": "^2.0.5",
    "just-diff": "^6.0.2",
    "knip": "^5.82.1",
    "linkedom": "^0.18.12",
    "lint-staged": "^16.2.7",
    "markdown-table": "^3.0.4",
    "mcp-hello-world": "^1.1.2",
    "mime": "^4.1.0",
    "node-fetch": "^3.3.2",
    "node-gyp": "^11.5.0",
    "openapi-typescript": "^7.10.1",
    "p-map": "^7.0.4",
    "prettier": "^3.8.1",
    "raw-loader": "^4.0.2",
    "remark-cli": "^12.0.1",
    "remark-frontmatter": "^5.0.0",
    "remark-mdx": "^3.1.1",
    "remark-parse": "^11.0.0",
    "require-in-the-middle": "^8.0.1",
    "semantic-release": "^21.1.2",
    "stylelint": "^16.12.0",
    "tsx": "^4.21.0",
    "type-fest": "^5.4.1",
    "typescript": "^5.9.3",
    "unified": "^11.0.5",
    "unist-util-visit": "^5.1.0",
    "vite": "^8.0.9",
    "vite-plugin-pwa": "^1.2.0",
    "vite-tsconfig-paths": "^6.1.1",
    "vitest": "^3.2.4"
  },
  "packageManager": "pnpm@10.33.0+sha512.10568bb4a6afb58c9eb3630da90cc9516417abebd3fabbe6739f0ae795728da1491e9db5a544c76ad8eb7570f5c4bb3d6c637b2cb41bfdcdb47fa823c8649319",
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org"
  },
  "pnpm": {
    "onlyBuiltDependencies": [
      "@lobehub/editor",
      "ffmpeg-static"
    ],
    "overrides": {
      "@react-pdf/image": "3.0.4",
      "@types/react": "19.2.13",
      "better-auth": "1.4.6",
      "better-call": "1.1.8",
      "drizzle-orm": "^0.45.1",
      "fast-xml-parser": "5.4.2",
      "lexical": "0.42.0",
      "pdfjs-dist": "5.4.530",
      "stylelint-config-clean-order": "7.0.0"
    },
    "patchedDependencies": {
      "@upstash/qstash": "patches/@upstash__qstash.patch"
    }
  }
}



================================================
FILE: pnpm-workspace.yaml
================================================
packages:
  - packages/**
  - .
  - e2e
  - apps/desktop/src/main

onlyBuiltDependencies:
  - '@vercel/speed-insights'
  - '@lobehub/editor'

overrides:
  jose: ^6.1.3
  stylelint-config-clean-order: 7.0.0
  pdfjs-dist: 5.4.530
  react: 19.2.4
  react-dom: 19.2.4
  '@react-pdf/image': 3.0.4

patchedDependencies:
  '@upstash/qstash': patches/@upstash__qstash.patch



================================================
FILE: prettier.config.mjs
================================================
import { prettier } from '@lobehub/lint';

export default prettier;



================================================
FILE: renovate.json
================================================
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "automerge": false,
  "dependencyDashboard": true,
  "extends": [
    "config:recommended",
    ":dependencyDashboard",
    "schedule:weekly",
    ":prHourlyLimitNone",
    ":prConcurrentLimitNone",
    ":semanticPrefixFixDepsChoreOthers",
    "group:monorepos",
    "group:recommended",
    "replacements:all",
    "workarounds:all"
  ],
  "ignoreDeps": [],
  "labels": ["dependencies"],
  "packageRules": [
    {
      "description": "Un-group tilde ranges",
      "matchManagers": ["npm", "pnpm", "yarn", "bun"],
      "matchCurrentValue": "^~.*$",
      "groupName": null,
      "groupSlug": null,
      "separateMajorMinor": true,
      "separateMinorPatch": true
    },
    {
      "description": "Un-group pinned deps (exact x.y.z)",
      "matchManagers": ["npm", "pnpm", "yarn", "bun"],
      "matchCurrentValue": "/^\\d+\\.\\d+\\.\\d+([+-][0-9A-Za-z.-]+)?$/",
      "groupName": null,
      "groupSlug": null,
      "separateMajorMinor": true,
      "separateMinorPatch": true
    },
    {
      "description": "Un-group experimental caret ranges (^0.x)",
      "matchManagers": ["npm", "pnpm", "yarn", "bun"],
      "matchCurrentValue": "^\\^0\\.\\d+(\\.\\d+)?([+-][0-9A-Za-z.-]+)?$",
      "groupName": null,
      "separateMajorMinor": true,
      "separateMinorPatch": true
    },
    {
      "description": "Group ^>=1 ranges for patch/minor",
      "matchManagers": ["npm", "pnpm", "yarn", "bun"],
      "matchCurrentValue": "/^\\^[1-9]+[0-9]*(\\.\\d+){0,2}([+-][0-9A-Za-z.-]+)?$/",
      "matchUpdateTypes": ["minor", "patch"],
      "groupName": "all non-major dependencies",
      "groupSlug": "all-non-major-dependencies"
    }
  ],
  "postUpdateOptions": ["yarnDedupeHighest"],
  "prConcurrentLimit": 30,
  "prHourlyLimit": 0,
  "rangeStrategy": "bump",
  "rebaseWhen": "conflicted",
  "schedule": "on sunday before 6:00am",
  "separateMajorMinor": true,
  "separateMinorPatch": false,
  "timezone": "UTC"
}



================================================
FILE: SECURITY.md
================================================
# Security Policy

## Supported Versions

We only provide security fixes for the **latest 2.x release**. Older versions (including all 1.x releases) are end-of-life and will not receive patches.

| Version      | Supported |
| ------------ | --------- |
| 2.x (latest) | ✅        |
| 1.x          | ❌        |
| 0.x          | ❌        |

If you are running a 1.x deployment, we strongly recommend upgrading to the latest 2.x release.

## Reporting a Vulnerability

Please report security vulnerabilities through the GitHub Security Advisory ["Report a Vulnerability"](https://github.com/lobehub/lobehub/security/advisories/new) tab.

**Please do not report security vulnerabilities through public GitHub issues.**

### Response Timeline

- **Acknowledgement**: We aim to respond to all reports within **7 days**.
- **Fix**: Confirmed vulnerabilities will be addressed within **30 days**.
- **Urgent issues**: If you believe the vulnerability is critical and actively exploitable, you can reach out directly on Discord (`arvinxu`) for faster coordination.

### What to Include

A good vulnerability report should include:

- A clear description of the issue and its potential impact
- The affected version (must be the latest 2.x release)
- Step-by-step reproduction instructions or a working PoC
- Any relevant logs, screenshots, or code references

## Scope

### In Scope

- Security issues affecting the **latest 2.x release** of LobeHub
- Vulnerabilities in the **server-side deployment** (LobeHub Cloud or self-hosted server mode)
- Issues that can be exploited **without requiring admin/owner access** to the deployment

### Out of Scope (Not a Vulnerability)

The following are considered **by design** or **out of scope** and will not be accepted as vulnerability reports:

#### 1. End-of-Life Versions

Any issue that only affects 1.x or earlier versions. This includes but is not limited to the `X-lobe-chat-auth` header mechanism, `webapi` route authentication, and other 1.x-specific architectures that have been completely removed in 2.x.

#### 2. File Proxy Public Access (`/f/:id`)

The file proxy endpoint `/f/:id` uses randomly generated, non-enumerable IDs as [capability URLs](https://www.w3.org/TR/capability-urls/). This is a deliberate design choice, similar to how S3 presigned URLs or Google Docs sharing links work. Knowing the URL grants access — this is by design, not an authorization bypass.

#### 3. User Enumeration on Login Flows

Endpoints such as `check-user` that indicate whether an account exists are part of the standard login UX. This is a common and intentional pattern used by most modern authentication flows.

#### 4. Self-Hosted Client-Side API Key Storage

In self-hosted client-side mode, users configure their own API keys which are stored in the browser's local storage. This is the expected behavior for client-side deployments where the user is both the operator and the consumer.

#### 5. Issues Requiring Admin or Owner Privileges

Actions that require administrative access to the deployment (e.g., environment variable configuration, server-side settings) are not considered security vulnerabilities, as the admin is already a trusted party.

#### 6. Theoretical Attacks Without Practical Impact

Reports based on theoretical attack scenarios without a working proof of concept against a realistic deployment, or issues that require unlikely preconditions (e.g., physical access to the server, pre-existing compromise of the host system).

## Disclosure Policy

- We follow [coordinated vulnerability disclosure](https://en.wikipedia.org/wiki/Coordinated_vulnerability_disclosure).
- We will credit reporters in the security advisory unless they prefer to remain anonymous.
- Please allow us reasonable time to address the issue before any public disclosure.

## Contact

- **Primary**: [GitHub Security Advisories](https://github.com/lobehub/lobehub/security/advisories/new)
- **Urgent**: Discord — `arvinxu`



================================================
FILE: stylelint.config.mjs
================================================
import { stylelint } from '@lobehub/lint';

export default {
  ...stylelint,
  rules: {
    ...stylelint.rules,
    // Temporarily disabled for gradual migration
    'declaration-property-value-keyword-no-deprecated': null,
    'declaration-property-value-no-unknown': null,
    'selector-class-pattern': null,
    'selector-id-pattern': null,
  },
};



================================================
FILE: tsconfig.json
================================================
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["dom", "dom.iterable", "dom.asynciterable", "esnext", "webworker"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "types": ["vitest/globals"],
    "paths": {
      "@/database/*": ["./packages/database/src/*", "./src/database/*"],
      "@/const/*": ["./packages/const/src/*", "./src/const/*"],
      "@/utils/*": ["./packages/utils/src/*", "./src/utils/*"],
      "@/types/*": ["./packages/types/src/*", "./src/types/*"],
      "@/*": ["./src/*"],
      "~test-utils": ["./tests/utils.tsx"]
    },
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "exclude": [
    "node_modules",
    "apps/desktop/**",
    "apps/device-gateway/**",
    "apps/mobile/**",
    "tmp",
    "temp",
    ".temp",
    "e2e/**",
    "knip.ts"
  ],
  "include": [
    "src/**/*.d.ts",
    "src/**/*.ts",
    "src/**/*.tsx",
    "packages/**/*.d.ts",
    "packages/**/*.ts",
    "packages/**/*.tsx",
    "tests/**/*.d.ts",
    "tests/**/*.ts",
    "tests/**/*.tsx",
    "scripts/**/*.ts",
    "scripts/**/*.mts",
    "scripts/**/*.cts",
    "*.ts",
    "*.mts",
    "*.cts",
    ".next/types/**/*.ts",
    "next-env.d.ts",
    ".next/dev/types/**/*.ts"
  ],
  "references": [
    {
      "path": "./apps/desktop"
    }
  ]
}



================================================
FILE: vercel.json
================================================
{
  "buildCommand": "bun run build:vercel",
  "headers": [
    {
      "source": "/_spa/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800, stale-if-error=86400, immutable"
        },
        {
          "key": "CDN-Cache-Control",
          "value": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800, stale-if-error=86400, immutable"
        }
      ]
    },
    {
      "source": "/_dangerous_local_dev_proxy",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
        },
        {
          "key": "Pragma",
          "value": "no-cache"
        },
        {
          "key": "Expires",
          "value": "0"
        }
      ]
    },
    {
      "source": "/_dangerous_local_dev_proxy/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
        },
        {
          "key": "Pragma",
          "value": "no-cache"
        },
        {
          "key": "Expires",
          "value": "0"
        }
      ]
    }
  ],
  "installCommand": "npx pnpm@10.26.2 install",
  "rewrites": [
    {
      "source": "/_dangerous_local_dev_proxy",
      "destination": "/_dangerous_local_dev_proxy.html"
    },
    {
      "source": "/_dangerous_local_dev_proxy/:path*",
      "destination": "/_dangerous_local_dev_proxy.html"
    }
  ]
}



================================================
FILE: vite.config.ts
================================================
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import type { PluginOption, ViteDevServer } from 'vite';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

import { viteEnvRestartKeys } from './plugins/vite/envRestartKeys';
import {
  createSharedRolldownOutput,
  sharedOptimizeDeps,
  sharedRendererDefine,
  sharedRendererPlugins,
} from './plugins/vite/sharedRendererConfig';
import { vercelSkewProtection } from './plugins/vite/vercelSkewProtection';

const isMobile = process.env.MOBILE === 'true';
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

const isDev = process.env.NODE_ENV !== 'production';
const platform = isMobile ? 'mobile' : 'web';

const resolveCommandExecutable = (cmd: string) => {
  const pathValue = process.env.PATH;
  if (!pathValue) return;

  if (process.platform === 'win32') {
    const pathExt = (process.env.PATHEXT || '.COM;.EXE;.BAT;.CMD')
      .split(';')
      .filter(Boolean)
      .map((ext) => ext.toLowerCase());
    const candidateNames = cmd.includes('.') ? [cmd] : pathExt.map((ext) => `${cmd}${ext}`);

    for (const entry of pathValue.split(path.delimiter).filter(Boolean)) {
      for (const candidate of candidateNames) {
        const resolved = path.win32.join(entry, candidate);
        if (fs.existsSync(resolved)) return resolved;
      }
    }

    return;
  }

  for (const entry of pathValue.split(path.delimiter).filter(Boolean)) {
    const resolved = path.join(entry, cmd);
    if (fs.existsSync(resolved)) return resolved;
  }
};

const openExternalBrowser = async (
  url: string,
  logger?: { warn: (msg: string) => void },
): Promise<boolean> => {
  const command =
    process.platform === 'win32'
      ? {
          args: ['url.dll,FileProtocolHandler', url],
          cmd: 'rundll32',
        }
      : {
          args: [url],
          cmd: process.platform === 'darwin' ? 'open' : 'xdg-open',
        };

  const executable = resolveCommandExecutable(command.cmd);
  if (!executable) {
    logger?.warn(`openExternalBrowser: ${command.cmd} not found on PATH`);
    return false;
  }

  return new Promise<boolean>((resolve) => {
    try {
      const child = spawn(executable, command.args, {
        detached: true,
        stdio: 'ignore',
      });
      let settled = false;
      const done = (ok: boolean, reason?: string) => {
        if (settled) return;
        settled = true;
        if (!ok && reason) logger?.warn(`openExternalBrowser: ${reason}`);
        resolve(ok);
      };
      child.once('error', (err) => done(false, (err as Error).message));
      child.once('spawn', () => {
        child.unref();
        done(true);
      });
      setTimeout(() => done(true), 200);
    } catch (e) {
      logger?.warn(`openExternalBrowser: ${(e as Error).message}`);
      resolve(false);
    }
  });
};

export default defineConfig({
  base: isDev ? '/' : process.env.VITE_CDN_BASE || '/_spa/',
  build: {
    outDir: isMobile ? 'dist/mobile' : 'dist/desktop',
    reportCompressedSize: false,
    rolldownOptions: {
      input: path.resolve(__dirname, isMobile ? 'index.mobile.html' : 'index.html'),
      output: createSharedRolldownOutput({ strictExecutionOrder: true }),
    },
  },
  define: sharedRendererDefine({ isMobile, isElectron: false }),
  experimental: {
    bundledDev: true,
  },
  resolve: {
    tsconfigPaths: true,
  },
  optimizeDeps: sharedOptimizeDeps,
  plugins: [
    vercelSkewProtection(),
    viteEnvRestartKeys(['APP_URL']),
    ...sharedRendererPlugins({ platform }),

    isDev && {
      name: 'lobe-dev-proxy-print',
      configureServer(server: ViteDevServer) {
        const ONLINE_HOST = 'https://app.lobehub.com';
        const c = {
          green: (s: string) => `\x1B[32m${s}\x1B[0m`,
          bold: (s: string) => `\x1B[1m${s}\x1B[0m`,
          cyan: (s: string) => `\x1B[36m${s}\x1B[0m`,
        };
        const { info } = server.config.logger;
        const isBundledDev = (server.config.experimental as any)?.bundledDev;

        const getProxyUrl = () => {
          const urls = server.resolvedUrls;
          if (!urls?.local?.[0]) return;
          const localHost = urls.local[0].replace(/\/$/, '');
          return `${ONLINE_HOST}/_dangerous_local_dev_proxy?debug-host=${encodeURIComponent(localHost)}`;
        };
        const printProxyUrl = () => {
          const proxyUrl = getProxyUrl();
          if (!proxyUrl) return;
          const colorUrl = (url: string) =>
            c.cyan(url.replace(/:(\d+)\//, (_, port) => `:${c.bold(port)}/`));
          info(`  ${c.green('➜')}  ${c.bold('Debug Proxy')}: ${colorUrl(proxyUrl)}`);
        };
        const openProxyUrl = async () => {
          const proxyUrl = getProxyUrl();
          if (!proxyUrl) return;

          const opened = await openExternalBrowser(proxyUrl, server.config.logger);

          if (!opened) {
            server.config.logger.warn(`Failed to open Debug Proxy automatically: ${proxyUrl}`);
          }
        };

        if (isBundledDev) {
          // Disable Vite's built-in browser opening. We always open the debug
          // proxy URL after the first bundled compile finishes instead.
          server.openBrowser = () => {};

          const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
          let spinnerIdx = 0;
          let spinnerTimer: NodeJS.Timeout | null = null;
          const formatElapsed = (ms: number) =>
            ms < 1000 ? `${Math.max(0, Math.round(ms))}ms` : `${(ms / 1000).toFixed(1)}s`;

          const startSpinner = (msg: string, since: number) => {
            spinnerIdx = 0;
            spinnerTimer = setInterval(() => {
              const elapsed = formatElapsed(Date.now() - since);
              process.stdout.write(`\r${c.cyan(spinnerFrames[spinnerIdx])} ${msg} (${elapsed})`);
              spinnerIdx = (spinnerIdx + 1) % spinnerFrames.length;
            }, 80);
          };
          const stopSpinner = (clearLine = true) => {
            if (spinnerTimer) {
              clearInterval(spinnerTimer);
              spinnerTimer = null;
            }
            if (clearLine) process.stdout.write('\r\x1B[K');
          };

          server.httpServer?.once('listening', () => {
            void (async () => {
              const rootUrl =
                server.resolvedUrls?.local?.[0] ||
                `http://localhost:${String(server.config.server.port || 9876)}/`;
              const startedAt = Date.now();
              const timeout = 180_000;
              const interval = 400;
              let ready = false;

              startSpinner('Vite: compile and bundle...', startedAt);

              try {
                while (Date.now() - startedAt < timeout) {
                  try {
                    const res = await fetch(rootUrl, { signal: AbortSignal.timeout(5_000) });
                    const text = await res.text();
                    if (text.includes('Bundling in progress')) {
                      await new Promise((r) => setTimeout(r, interval));
                      continue;
                    }
                    ready = true;
                    stopSpinner();
                    info(
                      `  ${c.green('✅')}  Vite: compile and bundle finished (${res.status}) ${rootUrl}`,
                    );
                    void openProxyUrl();
                    break;
                  } catch {
                    await new Promise((r) => setTimeout(r, interval));
                  }
                }
              } catch (e) {
                stopSpinner();
                console.warn('⚠️ Vite: could not wait for compile and bundle:', e);
              }

              if (!ready && spinnerTimer) {
                stopSpinner();
                console.warn(`⚠️ Vite: compile and bundle timed out after ${timeout / 1000}s`);
              }

              printProxyUrl();
            })();
          });
        }

        return () => {
          server.printUrls = () => {
            if (isBundledDev) return;
            printProxyUrl();
          };
        };
      },
    },

    VitePWA({
      injectRegister: null,
      manifest: false,
      registerType: 'prompt',
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        runtimeCaching: [
          {
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          },
          {
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxAgeSeconds: 60 * 60 * 24 * 365, maxEntries: 30 },
            },
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          },
          {
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'image-assets',
              expiration: { maxAgeSeconds: 60 * 60 * 24 * 30, maxEntries: 100 },
            },
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|avif)$/i,
          },
          {
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxAgeSeconds: 60 * 5, maxEntries: 50 },
            },
            urlPattern: /\/(api|trpc)\/.*/i,
          },
        ],
      },
    }),
  ].filter(Boolean) as PluginOption[],

  server: {
    cors: true,
    host: true,
    port: 9876,
    proxy: {
      '/api': `http://localhost:${process.env.PORT || 3010}`,
      '/oidc': `http://localhost:${process.env.PORT || 3010}`,
      '/trpc': `http://localhost:${process.env.PORT || 3010}`,
      '/webapi': `http://localhost:${process.env.PORT || 3010}`,
    },
    warmup: {
      clientFiles: [
        // src/ business code
        './src/initialize.ts',
        './src/spa/**/*.tsx',
        './src/business/**/*.{ts,tsx}',
        './src/components/**/*.{ts,tsx}',
        './src/config/**/*.ts',
        './src/const/**/*.ts',
        './src/envs/**/*.ts',
        './src/features/**/*.{ts,tsx}',
        './src/helpers/**/*.ts',
        './src/hooks/**/*.{ts,tsx}',
        './src/layout/**/*.{ts,tsx}',
        './src/libs/**/*.{ts,tsx}',
        './src/locales/**/*.ts',
        './src/routes/**/*.{ts,tsx}',
        './src/services/**/*.ts',
        './src/store/**/*.{ts,tsx}',
        './src/styles/**/*.ts',
        './src/utils/**/*.{ts,tsx}',

        // monorepo packages
        './packages/types/src/**/*.ts',
        './packages/const/src/**/*.ts',
        './packages/utils/src/**/*.ts',
        './packages/context-engine/src/**/*.ts',
        './packages/prompts/src/**/*.ts',
        './packages/model-bank/src/**/*.ts',
        './packages/model-runtime/src/**/*.ts',
        './packages/agent-runtime/src/**/*.ts',
        './packages/conversation-flow/src/**/*.ts',
        './packages/electron-client-ipc/src/**/*.ts',
        './packages/builtin-agents/src/**/*.ts',
        './packages/builtin-skills/src/**/*.ts',
        './packages/builtin-tool-*/src/**/*.ts',
        './packages/builtin-tools/src/**/*.ts',
        './packages/business/*/src/**/*.ts',
        './packages/config/src/**/*.ts',
        './packages/edge-config/src/**/*.ts',
        './packages/editor-runtime/src/**/*.ts',
        './packages/fetch-sse/src/**/*.ts',
        './packages/desktop-bridge/src/**/*.ts',
        './packages/python-interpreter/src/**/*.ts',
        './packages/agent-manager-runtime/src/**/*.ts',
      ],
    },
  },
});



================================================
FILE: vitest.config.mts
================================================
import { dirname, join, resolve } from 'node:path';

import tsconfigPaths from 'vite-tsconfig-paths';
import { coverageConfigDefaults, defineConfig } from 'vitest/config';

const alias = {
  '@emoji-mart/data': resolve(__dirname, './tests/mocks/emojiMartData.ts'),
  '@emoji-mart/react': resolve(__dirname, './tests/mocks/emojiMartReact.tsx'),
  '@/database/_deprecated': resolve(__dirname, './src/database/_deprecated'),
  '@/utils/client/switchLang': resolve(__dirname, './src/utils/client/switchLang'),
  '@/const/locale': resolve(__dirname, './src/const/locale'),
  // TODO: after refactor the errorResponse, we can remove it
  '@/utils/errorResponse': resolve(__dirname, './src/utils/errorResponse'),
  '@/utils/unzipFile': resolve(__dirname, './src/utils/unzipFile'),
  '@/utils/server': resolve(__dirname, './src/utils/server'),
  '@/utils/identifier': resolve(__dirname, './src/utils/identifier'),
  '@/utils/electron': resolve(__dirname, './src/utils/electron'),
  '@/utils/markdownToTxt': resolve(__dirname, './src/utils/markdownToTxt'),
  '@/utils/sanitizeFileName': resolve(__dirname, './src/utils/sanitizeFileName'),
  '~test-utils': resolve(__dirname, './tests/utils.tsx'),
  'lru_map': resolve(__dirname, './tests/mocks/lru_map'),
};

export default defineConfig({
  optimizeDeps: {
    exclude: ['crypto', 'util', 'tty'],
    include: ['@lobehub/tts'],
  },
  plugins: [
    tsconfigPaths({ projects: ['.'] }),
    // Let `.md` imports resolve to their raw text content so Rollup/Vitest
    // doesn't try to parse Markdown as JavaScript.
    {
      name: 'raw-md',
      transform(_, id) {
        if (id.endsWith('.md'))
          return { code: 'export default ""', map: null };
      },
    },
    /**
     * @lobehub/fluent-emoji@4.0.0 ships `es/FluentEmoji/style.js` but its `es/FluentEmoji/index.js`
     * imports `./style/index.js` which doesn't exist.
     *
     * In app bundlers this can be tolerated/rewritten, but Vite/Vitest resolves it strictly and
     * fails the whole test run. Redirect it to the real file.
     */
    {
      enforce: 'pre',
      name: 'fix-lobehub-fluent-emoji-style-import',
      resolveId(id, importer) {
        if (!importer) return null;

        const isFluentEmojiEntry =
          importer.endsWith('/@lobehub/fluent-emoji/es/FluentEmoji/index.js') ||
          importer.includes('/@lobehub/fluent-emoji/es/FluentEmoji/index.js?');

        const isMissingStyleIndex =
          id === './style/index.js' ||
          id.endsWith('/@lobehub/fluent-emoji/es/FluentEmoji/style/index.js') ||
          id.endsWith('/@lobehub/fluent-emoji/es/FluentEmoji/style/index.js?') ||
          id.endsWith('/FluentEmoji/style/index.js') ||
          id.endsWith('/FluentEmoji/style/index.js?');

        if (isFluentEmojiEntry && isMissingStyleIndex)
          return resolve(dirname(importer), 'style.js');

        return null;
      },
    },
  ],
  resolve: {
    alias,
  },
  test: {
    alias,
    coverage: {
      all: false,
      exclude: [
        // https://github.com/lobehub/lobe-chat/pull/7265
        ...coverageConfigDefaults.exclude,
        '__mocks__/**',
        '**/packages/**',
        // just ignore the migration code
        // we will use pglite in the future
        // so the coverage of this file is not important
        'src/database/client/core/db.ts',
        'src/utils/fetch/fetchEventSource/*.ts',
      ],
      provider: 'v8',
      reporter: ['text', 'json', 'lcov', 'text-summary'],
      reportsDirectory: './coverage/app',
    },
    environment: 'happy-dom',
    exclude: [
      '**/node_modules/**',
      '**/.*/**',
      '**/dist/**',
      '**/build/**',
      '**/tmp/**',
      '**/temp/**',
      '**/docs/**',
      '**/locales/**',
      '**/public/**',
      '**/apps/desktop/**',
      '**/apps/mobile/**',
      '**/apps/cli/**',
      '**/packages/**',
      '**/e2e/**',
    ],
    globals: true,
    server: {
      deps: {
        inline: [
          'vitest-canvas-mock',
          /@emoji-mart/,
          'emoji-mart',
          '@lobehub/ui',
          '@lobehub/fluent-emoji',
          '@pierre/diffs',
          '@pierre/diffs/react',
          'lru_map',
          'lexical',
          /@lexical\//,
          /@lobehub\//,
        ],
      },
    },
    setupFiles: join(__dirname, './tests/setup.ts'),
  },
});



================================================
FILE: .bunfig.toml
================================================
[install.lockfile]

save = false



================================================
FILE: .changelogrc.cjs
================================================
module.exports = require('@lobehub/lint').changelog;



================================================
FILE: .console-log-whitelist.json
================================================
{
  "files": ["drizzle.config.ts"],
  "patterns": [
    "scripts/**",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "**/examples/**",
    "e2e/**",
    ".github/scripts/**",
    "apps/desktop/**"
  ]
}



================================================
FILE: .cursorindexingignore
================================================
# Add directories or file patterns to ignore during indexing (e.g. foo/ or *.csv)
locales/
apps/desktop/resources/locales/
**/__snapshots__/
**/fixtures/
src/database/migrations/



================================================
FILE: .dockerignore
================================================
Dockerfile
.dockerignore
node_modules
npm-debug.log
.next
.git
.github
*.md
.env.example



================================================
FILE: .editorconfig
================================================
# http://editorconfig.org
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab



================================================
FILE: .env.desktop
================================================
# copy this file to .env when you want to develop the desktop app or you will fail
APP_URL=http://localhost:3015
FEATURE_FLAGS=-check_updates,+pin_list
KEY_VAULTS_SECRET=oLXWIiR/AKF+rWaqy9lHkrYgzpATbW3CtJp3UfkVgpE=
DATABASE_URL=postgresql://postgres@localhost:5432/postgres
SEARCH_PROVIDERS=search1api
DESKTOP_BUILD=true



================================================
FILE: .env.example
================================================
# Specify your API Key selection method, currently supporting `random` and `turn`.
# API_KEY_SELECT_MODE=random

# #######################################
# ########## Security Settings ###########
# #######################################

# Control Content Security Policy headers
# Set to '1' to enable X-Frame-Options and Content-Security-Policy headers
# Default is '0' (enabled)
# ENABLED_CSP=1

# SSRF Protection Settings
# Set to '1' to allow connections to private IP addresses (disable SSRF protection)
# WARNING: Only enable this in trusted environments
# Default is '0' (SSRF protection enabled)
# SSRF_ALLOW_PRIVATE_IP_ADDRESS=0

# Whitelist of allowed private IP addresses (comma-separated)
# Only takes effect when SSRF_ALLOW_PRIVATE_IP_ADDRESS is '0'
# Example: Allow specific internal servers while keeping SSRF protection
# SSRF_ALLOW_IP_ADDRESS_LIST=192.168.1.100,10.0.0.50

# #######################################
# ########### Redis Settings ############
# #######################################

# Connection string for self-hosted Redis (Docker/K8s/managed). Use container hostname when running via docker-compose.
# REDIS_URL=redis://localhost:6379

# Optional database index.
# REDIS_DATABASE=0

# Optional authentication for managed Redis.
# REDIS_USERNAME=default
# REDIS_PASSWORD=yourpassword

# Set to '1' to enforce TLS when connecting to managed Redis or rediss:// endpoints.
# REDIS_TLS=0

# Namespace prefix for cache/queue keys.
# REDIS_PREFIX=lobechat

# #######################################
# ######### AI Provider Service #########
# #######################################

# ## OpenAI ###

# you openai api key
OPENAI_API_KEY=sk-xxxxxxxxx

# use a proxy to connect to the OpenAI API
# OPENAI_PROXY_URL=https://api.openai.com/v1

# add your custom model name, multi model separate by comma. for example gpt-3.5-1106,gpt-4-1106
# OPENAI_MODEL_LIST=gpt-3.5-turbo


# ## Azure OpenAI ###

# you can learn azure OpenAI Service on https://learn.microsoft.com/en-us/azure/ai-services/openai/overview
# use Azure OpenAI Service by uncomment the following line

# The API key you applied for on the Azure OpenAI account page, which can be found in the "Keys and Endpoints" section.
# AZURE_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# The endpoint you applied for on the Azure OpenAI account page, which can be found in the "Keys and Endpoints" section.
# AZURE_ENDPOINT=https://docs-test-001.openai.azure.com

# Azure's API version, follows the YYYY-MM-DD format
# AZURE_API_VERSION=2024-10-21


# ## Anthropic Service ####

# ANTHROPIC_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# use a proxy to connect to the Anthropic API
# ANTHROPIC_PROXY_URL=https://api.anthropic.com


# ## Google AI  ####

# GOOGLE_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx


# ## AWS Bedrock  ###

# AWS_REGION=us-east-1
# AWS_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxx
# AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx


# ## Ollama AI ####

# You can use ollama to get and run LLM locally, learn more about it via https://github.com/ollama/ollama

# The local/remote ollama service url
# OLLAMA_PROXY_URL=http://127.0.0.1:11434

# OLLAMA_MODEL_LIST=your_ollama_model_names


# ## OpenRouter Service ###

# OPENROUTER_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# OPENROUTER_MODEL_LIST=model1,model2,model3


# ## Mistral AI ###

# MISTRAL_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ## Perplexity Service ###

# PERPLEXITY_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ## Groq Service ####

# GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ### 01.AI Service ####

# ZEROONE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ## TogetherAI Service ###

# TOGETHERAI_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ## ZhiPu AI ###

# ZHIPU_API_KEY=xxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxx

# ## Moonshot AI  ####

# MOONSHOT_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ## Kimi Code Plan  ####

# KIMICODINGPLAN_PROXY_URL=https://api.kimi.com/coding
# KIMICODINGPLAN_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ## Minimax AI  ####

# MINIMAX_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ## DeepSeek AI  ####

# DEEPSEEK_PROXY_URL=https://api.deepseek.com/v1
# DEEPSEEK_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ## Qiniu AI  ####

# QINIU_PROXY_URL=https://api.qnaigc.com/v1
# QINIU_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ## Qwen AI  ####

# QWEN_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ## Cloudflare Workers AI  ####

# CLOUDFLARE_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# CLOUDFLARE_BASE_URL_OR_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ## SiliconCloud AI  ####

# SILICONCLOUD_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx


# ## TencentCloud AI  ####

# TENCENT_CLOUD_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ## PPIO ####

# PPIO_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ## INFINI-AI ###

# INFINIAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx


# ## 302.AI ###

# AI302_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ## ModelScope ###

# MODELSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ## AiHubMix ###

# AIHUBMIX_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ## BFL ###

# BFL_API_KEY=bfl-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ## FAL ###

# FAL_API_KEY=fal-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# #######################################
# ######## AI Image Settings ############
# #######################################

# Default image generation count (range: 1-20, default: 4)
# AI_IMAGE_DEFAULT_IMAGE_NUM=4

# ## Nebius ###

# NEBIUS_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ## NewAPI Service ###

# NEWAPI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# NEWAPI_PROXY_URL=https://your-newapi-server.com

# ## Vercel AI Gateway ###

# VERCELAIGATEWAY_API_KEY=your_vercel_ai_gateway_api_key


# #######################################
# ########### Market Service ############
# #######################################

# The LobeChat agents market index url
# AGENTS_INDEX_URL=https://chat-agents.lobehub.com

# #######################################
# ########### Plugin Service ############
# #######################################

# The LobeChat plugins store index url
# PLUGINS_INDEX_URL=https://chat-plugins.lobehub.com

# set the plugin settings
# the format is `plugin-identifier:key1=value1;key2=value2`, multiple settings fields are separated by semicolons `;`, multiple plugin settings are separated by commas `,`.
# PLUGIN_SETTINGS=search-engine:SERPAPI_API_KEY=xxxxx

# #######################################
# ###### Doc / Changelog Service ########
# #######################################

# Use in Changelog / Document service cdn url prefix
# DOC_S3_PUBLIC_DOMAIN=https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Use in dev cdn workflow
# DOC_S3_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# DOC_S3_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# #######################################
# ### Mobile SPA S3 Workflow ############
# #######################################

# Used by `bun run workflow:mobile-spa` to build mobile SPA, upload assets to S3, and generate template
# MOBILE_S3_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# MOBILE_S3_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# MOBILE_S3_BUCKET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# MOBILE_S3_ENDPOINT=https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# MOBILE_S3_REGION=auto
# MOBILE_S3_PUBLIC_DOMAIN=https://cdn.example.com
# MOBILE_S3_KEY_PREFIX=mobile/latest  # optional, S3 key path prefix

# #######################################
# #### S3 Object Storage Service ########
# #######################################

# S3 keys
# S3_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# S3_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Bucket name
# S3_BUCKET=lobechat

# Bucket request endpoint
# S3_ENDPOINT=https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxx.r2.cloudflarestorage.com

# Bucket region, such as us-west-1, generally not needed to add
# but some service providers may require configuration
# S3_REGION=us-west-1


# #######################################
# ########### Auth Service ##############
# #######################################

# Auth Secret (use `openssl rand -base64 32` to generate)
# AUTH_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Require email verification before allowing users to sign in (default: false)
# Set to '1' to force users to verify their email before signing in
# AUTH_EMAIL_VERIFICATION=0

# SSO Providers Configuration (for Better-Auth)
# Comma-separated list of enabled OAuth providers
# Supported providers: auth0, authelia, authentik, casdoor, cloudflare-zero-trust, cognito, generic-oidc, github, google, keycloak, logto, microsoft, microsoft-entra-id, okta, zitadel
# Example: AUTH_SSO_PROVIDERS=google,github,auth0,microsoft-entra-id
# AUTH_SSO_PROVIDERS=

# Email whitelist for registration (comma-separated)
# Supports full email (user@example.com) or domain (example.com)
# Leave empty to allow all emails
# AUTH_ALLOWED_EMAILS=example.com,admin@other.com

# Disable email/password authentication (SSO-only mode)
# Set to '1' to disable email/password sign-in and registration, only allowing SSO login
# AUTH_DISABLE_EMAIL_PASSWORD=0

# Google OAuth Configuration (for Better-Auth)
# Get credentials from: https://console.cloud.google.com/apis/credentials
# Authorized redirect URIs:
# - Development: http://localhost:3210/api/auth/callback/google
# - Production: https://yourdomain.com/api/auth/callback/google
# GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
# GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxx

# GitHub OAuth Configuration (for Better-Auth)
# Get credentials from: https://github.com/settings/developers
# Create a new OAuth App with:
# Authorized callback URL:
# - Development: http://localhost:3210/api/auth/callback/github
# - Production: https://yourdomain.com/api/auth/callback/github
# GITHUB_CLIENT_ID=Ov23xxxxxxxxxxxxx
# GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# AWS Cognito OAuth Configuration (for Better-Auth)
# Get credentials from: https://console.aws.amazon.com/cognito
# Setup steps:
# 1. Create a User Pool with App Client
# 2. Configure Hosted UI domain
# 3. Enable "Authorization code grant" OAuth flow
# 4. Set OAuth scopes: openid, profile, email
# Authorized callback URL:
# - Development: http://localhost:3210/api/auth/callback/cognito
# - Production: https://yourdomain.com/api/auth/callback/cognito
# COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxx
# COGNITO_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# COGNITO_DOMAIN=your-app.auth.us-east-1.amazoncognito.com
# COGNITO_REGION=us-east-1
# COGNITO_USERPOOL_ID=us-east-1_xxxxxxxxx

# Microsoft OAuth Configuration (for Better-Auth)
# Get credentials from: https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
# Create a new App Registration in Microsoft Entra ID (Azure AD)
# Authorized redirect URL:
# - Development: http://localhost:3210/api/auth/callback/microsoft
# - Production: https://yourdomain.com/api/auth/callback/microsoft
# MICROSOFT_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
# MICROSOFT_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# #######################################
# ########## Email Service ##############
# #######################################

# SMTP Server Configuration (required for email verification with Better-Auth)

# SMTP server hostname (e.g., smtp.gmail.com, smtp.office365.com)
# SMTP_HOST=smtp.example.com

# SMTP server port (usually 587 for TLS, or 465 for SSL)
# SMTP_PORT=587

# Use secure connection (set to 'true' for port 465, 'false' for port 587)
# SMTP_SECURE=false

# SMTP authentication username (usually your email address)
# SMTP_USER=your-email@example.com

# SMTP authentication password (use app-specific password for Gmail)
# SMTP_PASS=your-password-or-app-specific-password

# Sender email address (optional, defaults to SMTP_USER)
# Required for AWS SES where SMTP_USER is not a valid email address
# SMTP_FROM=noreply@example.com

# #######################################
# ######### Server Database #############
# #######################################

# Postgres database URL
# DATABASE_URL=postgres://username:password@host:port/database

# use `openssl rand -base64 32` to generate a key for the encryption of the database
# we use this key to encrypt the user api key and proxy url
# KEY_VAULTS_SECRET=xxxxx/xxxxxxxxxxxxxx=

# Specify the Embedding model and Reranker model(unImplemented)
# DEFAULT_FILES_CONFIG="embedding_model=openai/embedding-text-3-small,reranker_model=cohere/rerank-english-v3.0,query_mode=full_text"

# Embedding batch size for processing (default: 50)
# EMBEDDING_BATCH_SIZE=50

# Embedding concurrency for parallel processing (default: 10)
# EMBEDDING_CONCURRENCY=10

# #######################################
# ######### MCP Service Config ##########
# #######################################

# MCP tool call timeout (milliseconds)
# MCP_TOOL_TIMEOUT=60000

# #######################################
# ######### Klavis Service ##############
# #######################################

# Klavis API Key for accessing Strata hosted MCP servers
# Get your API key from: https://klavis.io
# IMPORTANT: This key is stored server-side only and NEVER exposed to the client
# When this key is set, Klavis integration will be automatically enabled
# KLAVIS_API_KEY=your_klavis_api_key_here

# #######################################
# #### Message Gateway (IM Integration) ##
# #######################################

# External message-gateway for unified IM platform connection management.
# Set ENABLED=1 to activate. To migrate away, remove ENABLED first (keep URL/TOKEN)
# so LobeHub can automatically disconnect leftover gateway connections.
# MESSAGE_GATEWAY_ENABLED=1
# MESSAGE_GATEWAY_URL=https://message-gateway.lobehub.com
# MESSAGE_GATEWAY_SERVICE_TOKEN=your_service_token_here



================================================
FILE: .env.example.development
================================================
# LobeChat Development Environment Configuration
# ⚠️ DO NOT USE THESE VALUES IN PRODUCTION!

# Application
APP_URL=http://localhost:3010

# Allow access to private IP addresses (localhost services) in development
# https://lobehub.com/docs/self-hosting/environment-variables/basic#ssrf-allow-private-ip-address
SSRF_ALLOW_PRIVATE_IP_ADDRESS=1

# Secrets (pre-generated for development only)
KEY_VAULTS_SECRET=ww+0igxjGRAAR/eTNFQ55VmhQB5KE5trFZseuntThJs=
AUTH_SECRET=ww+0igxjGRAAR/eTNFQ55VmhQB5KE5trFZseuntThJs=

# Database (PostgreSQL)
DATABASE_URL=postgresql://postgres:change_this_password_on_production@localhost:5432/lobechat
DATABASE_DRIVER=node

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PREFIX=lobechat
REDIS_TLS=0

# S3 Storage (RustFS)
S3_ACCESS_KEY_ID=admin
S3_SECRET_ACCESS_KEY=change_this_password_on_production
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=lobe
S3_ENABLE_PATH_STYLE=1
S3_SET_ACL=0

# LLM vision uses base64 to avoid S3 presigned URL issues in development
LLM_VISION_IMAGE_USE_BASE64=1

# Search (SearXNG)
SEARXNG_URL=http://localhost:8180

# Proxy (Optional)
# HTTP_PROXY=http://localhost:7890
# HTTPS_PROXY=http://localhost:7890

# AI Model API Keys (Required for chat functionality)
# ANTHROPIC_API_KEY=sk-ant-xxx
# ANTHROPIC_PROXY_URL=https://api.anthropic.com

# OPENAI_API_KEY=sk-xxx
# OPENAI_PROXY_URL=https://api.openai.com/v1




================================================
FILE: .i18nrc.js
================================================
const { defineConfig } = require('@lobehub/i18n-cli');
const fs = require('node:fs');
const path = require('node:path');

module.exports = defineConfig({
  entry: 'locales/en-US',
  entryLocale: 'en-US',
  output: 'locales',
  outputLocales: [
    'ar',
    'bg-BG',
    'zh-CN',
    'zh-TW',
    'ru-RU',
    'ja-JP',
    'ko-KR',
    'fr-FR',
    'tr-TR',
    'es-ES',
    'pt-BR',
    'de-DE',
    'it-IT',
    'nl-NL',
    'pl-PL',
    'vi-VN',
    'fa-IR',
  ],
  temperature: 0,
  saveImmediately: true,
  modelName: 'gpt-5.1-chat-latest',
  experimental: {
    jsonMode: true,
  },
  markdown: {
    reference:
      'You need to maintain the component format of the mdx file; the output text does not need to be wrapped in any code block syntax on the outermost layer.\n' +
      fs.readFileSync(path.join(__dirname, 'docs/glossary.md'), 'utf8'),
    entry: ['./README.md', './docs/**/*.md', './docs/**/*.mdx'],
    entryLocale: 'en-US',
    outputLocales: ['zh-CN'],
    includeMatter: true,
    exclude: ['./README.zh-CN.md', './docs/**/*.zh-CN.md', './docs/**/*.zh-CN.mdx'],
    outputExtensions: (locale, { filePath }) => {
      if (filePath.includes('.mdx')) {
        if (locale === 'en-US') return '.mdx';
        return `.${locale}.mdx`;
      } else {
        if (locale === 'en-US') return '.md';
        return `.${locale}.md`;
      }
    },
  },
});



================================================
FILE: .npmrc
================================================
lockfile=false
resolution-mode=highest
dedupe-peer-dependents=true

ignore-workspace-root-check=true
enable-pre-post-scripts=true


public-hoist-pattern[]=*@umijs/lint*
public-hoist-pattern[]=*changelog*
public-hoist-pattern[]=*commitlint*
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*postcss*
public-hoist-pattern[]=*prettier*
public-hoist-pattern[]=*remark*
public-hoist-pattern[]=*semantic-release*
public-hoist-pattern[]=*stylelint*

public-hoist-pattern[]=@auth/core
public-hoist-pattern[]=pdfjs-dist
public-hoist-pattern[]=@napi-rs/canvas-*



================================================
FILE: .nvmrc
================================================
lts/krypton



================================================
FILE: .prettierignore
================================================
# Prettierignore for LobeHub
################################################################

# general
.DS_Store
.editorconfig
.idea
.history
.temp
.env.local
.husky
.npmrc
.gitkeep
venv
temp
tmp
LICENSE

# dependencies
node_modules
*.log
*.lock
package-lock.json

# ci
coverage
.coverage
.eslintcache
.stylelintcache
test-output
__snapshots__
*.snap

# production
dist
es
lib
logs

# umi
.umi
.umi-production
.umi-test
.dumi/tmp*

# ignore files
.*ignore

# docker
docker
Dockerfile*

# image
*.webp
*.gif
*.png
*.jpg
*.svg

# misc
# add other ignore file below
.next


================================================
FILE: .releaserc.cjs
================================================
const config = require('@lobehub/lint').semanticRelease;

config.branches = [
  'main',
  {
    name: 'next',
    prerelease: true,
  },
];

config.plugins.push([
  '@semantic-release/exec',
  {
    prepareCmd: 'npm run workflow:changelog',
  },
]);

module.exports = config;



================================================
FILE: .remarkrc.mdx.mjs
================================================
import { remarklint } from '@lobehub/lint';

export default {
  ...remarklint,
  plugins: ['remark-mdx', ...remarklint.plugins, ['remark-lint-file-extension', false]],
};



================================================
FILE: .remarkrc.mjs
================================================
import { remarklint } from '@lobehub/lint';

export default remarklint;



================================================
FILE: .seorc.cjs
================================================
const { defineConfig } = require('@lobehub/seo-cli');

module.exports = defineConfig({
  entry: ['./docs/**/*.mdx'],
  modelName: 'gpt-4o-mini',
  experimental: {
    jsonMode: true,
  },
});



================================================
FILE: .stylelintignore
================================================
# Stylelintignore for LobeHub
################################################################

# dependencies
node_modules

# ci
coverage
.coverage

# production
dist
es
lib
logs

# framework specific
.next
.umi
.umi-production
.umi-test
.dumi/tmp*

# temporary directories
tmp
temp
.temp
.local
docs/.local

# cache directories
.cache

# AI coding tools directories
.claude
.serena

# MCP tools
/.serena/**


================================================
FILE: __mocks__/zustand/traditional.ts
================================================
import { act } from 'react-dom/test-utils';
import { beforeEach } from 'vitest';
import { createWithEqualityFn as actualCreate } from 'zustand/traditional';

// a variable to hold reset functions for all stores declared in the app
const storeResetFns = new Set<() => void>();

// when creating a store, we get its initial state, create a reset function and add it in the set
const createImpl = (createState: any) => {
  const store = actualCreate(createState, Object.is);
  const initialState = store.getState();
  storeResetFns.add(() => store.setState(initialState, true));
  return store;
};

// Reset all stores after each test run
beforeEach(() => {
  act(() => {
    for (const resetFn of storeResetFns) {
      resetFn();
    }
  });
});

export const createWithEqualityFn = (f: any) => (f === undefined ? createImpl : createImpl(f));



================================================
FILE: apps/cli/README.md
================================================
# @lobehub/cli

LobeHub command-line interface.

## Local Development

| Task                                       | Command                    |
| ------------------------------------------ | -------------------------- |
| Run in dev mode                            | `bun run dev -- <command>` |
| Build the CLI                              | `bun run build`            |
| Link `lh`/`lobe`/`lobehub` into your shell | `bun run cli:link`         |
| Remove the global link                     | `bun run cli:unlink`       |

- `bun run build` only generates `dist/index.js`.
- To make `lh` available in your shell, run `bun run cli:link`.
- After linking, if your shell still cannot find `lh`, run `rehash` in `zsh`.

## Custom Server URL

By default the CLI connects to `https://app.lobehub.com`. To point it at a different server (e.g. a local instance):

| Method               | Command                                                         | Persistence                         |
| -------------------- | --------------------------------------------------------------- | ----------------------------------- |
| Environment variable | `LOBEHUB_SERVER=http://localhost:4000 bun run dev -- <command>` | Current command only                |
| Login flag           | `lh login --server http://localhost:4000`                       | Saved to `~/.lobehub/settings.json` |

Priority: `LOBEHUB_SERVER` env var > `settings.json` > default official URL.

## Shell Completion

### Install completion for a linked CLI

| Shell  | Command                        |
| ------ | ------------------------------ |
| `zsh`  | `source <(lh completion zsh)`  |
| `bash` | `source <(lh completion bash)` |

### Use completion during local development

| Shell  | Command                                      |
| ------ | -------------------------------------------- |
| `zsh`  | `source <(bun src/index.ts completion zsh)`  |
| `bash` | `source <(bun src/index.ts completion bash)` |

- Completion is context-aware. For example, `lh agent <Tab>` shows agent subcommands instead of top-level commands.
- If you update completion logic locally, re-run the corresponding `source <(...)` command to reload it in the current shell session.
- Completion only registers shell functions. It does not install the `lh` binary by itself.

## Quick Check

```bash
which lh
lh --help
lh agent <TAB>
```



================================================
FILE: apps/cli/package.json
================================================
{
  "name": "@lobehub/cli",
  "version": "0.0.8",
  "type": "module",
  "bin": {
    "lh": "./dist/index.js",
    "lobe": "./dist/index.js",
    "lobehub": "./dist/index.js"
  },
  "man": [
    "./man/man1/lh.1",
    "./man/man1/lobe.1",
    "./man/man1/lobehub.1"
  ],
  "files": [
    "dist",
    "man"
  ],
  "scripts": {
    "build": "tsdown",
    "cli:link": "bun link",
    "cli:unlink": "bun unlink",
    "dev": "LOBEHUB_CLI_HOME=.lobehub-dev bun src/index.ts",
    "man:generate": "bun src/man/generate.ts",
    "prepublishOnly": "npm run build && npm run man:generate",
    "test": "bunx vitest run --config vitest.config.mts --silent='passed-only'",
    "test:coverage": "bunx vitest run --config vitest.config.mts --coverage",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "@lobechat/agent-gateway-client": "workspace:*",
    "@lobechat/device-gateway-client": "workspace:*",
    "@lobechat/local-file-shell": "workspace:*",
    "@trpc/client": "^11.8.1",
    "@types/node": "^22.13.5",
    "@types/ws": "^8.18.1",
    "commander": "^13.1.0",
    "debug": "^4.4.0",
    "diff": "^8.0.3",
    "fast-glob": "^3.3.3",
    "ignore": "^7.0.5",
    "picocolors": "^1.1.1",
    "superjson": "^2.2.6",
    "tsdown": "^0.21.4",
    "typescript": "^5.9.3",
    "ws": "^8.18.1"
  },
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org"
  }
}



================================================
FILE: apps/cli/pnpm-workspace.yaml
================================================
packages:
  - '../../packages/agent-gateway-client'
  - '../../packages/device-gateway-client'
  - '../../packages/local-file-shell'
  - '../../packages/file-loaders'
  - '.'



================================================
FILE: apps/cli/tsconfig.json
================================================
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ESNext"],
    "types": ["node"],
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "paths": {
      "@lobechat/device-gateway-client": ["../../packages/device-gateway-client/src"],
      "@lobechat/local-file-shell": ["../../packages/local-file-shell/src"],
      "@/*": ["../../src/*"]
    }
  },
  "exclude": ["**/*.test.ts"],
  "include": ["src"]
}



================================================
FILE: apps/cli/tsdown.config.ts
================================================
import { defineConfig } from 'tsdown';

export default defineConfig({
  banner: { js: '#!/usr/bin/env node' },
  clean: true,
  deps: {
    neverBundle: ['@napi-rs/canvas'],
  },
  entry: ['src/index.ts'],
  fixedExtension: false,
  format: ['esm'],
  minify: !!process.env.MINIFY,
  outputOptions: {
    codeSplitting: false,
  },
  platform: 'node',
  target: 'node18',
});



================================================
FILE: apps/cli/vitest.config.mts
================================================
import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: '@lobechat/device-gateway-client',
        replacement: path.resolve(__dirname, '../../packages/device-gateway-client/src/index.ts'),
      },
      {
        find: '@lobechat/local-file-shell',
        replacement: path.resolve(__dirname, '../../packages/local-file-shell/src/index.ts'),
      },
      {
        find: '@lobechat/file-loaders',
        replacement: path.resolve(__dirname, '../../packages/file-loaders/src/index.ts'),
      },
    ],
  },
  test: {
    coverage: {
      all: false,
      reporter: ['text', 'json', 'lcov', 'text-summary'],
    },
    environment: 'node',
    // Suppress unhandled rejection warnings from Commander async actions with mocked process.exit
    onConsoleLog: () => true,
  },
});



================================================
FILE: apps/cli/.npmrc
================================================
lockfile=false
ignore-workspace-root-check=true

public-hoist-pattern[]=*@umijs/lint*
public-hoist-pattern[]=*unicorn*
public-hoist-pattern[]=*changelog*
public-hoist-pattern[]=*commitlint*
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*postcss*
public-hoist-pattern[]=*prettier*
public-hoist-pattern[]=*remark*
public-hoist-pattern[]=*semantic-release*
public-hoist-pattern[]=*stylelint*




================================================
FILE: apps/cli/e2e/agent.e2e.test.ts
================================================
import { execSync } from 'node:child_process';

import { describe, expect, it } from 'vitest';

/**
 * E2E tests for `lh agent` agent management commands.
 *
 * Prerequisites:
 * - `lh` CLI is installed and linked globally
 * - User is authenticated (`lh login` completed)
 * - Network access to the LobeHub server
 *
 * These tests create a real agent, verify CRUD operations, then clean up.
 * Note: `agent run` and `agent status` are not tested here as they require
 * active SSE connections and running agents.
 */

const CLI = process.env.LH_CLI_PATH || 'lh';
const TIMEOUT = 30_000;

function run(args: string): string {
  return execSync(`${CLI} ${args}`, {
    encoding: 'utf-8',
    env: { ...process.env, PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}` },
    timeout: TIMEOUT,
  }).trim();
}

function runJson<T = any>(args: string): T {
  const output = run(args);
  return JSON.parse(output) as T;
}

describe('lh agent - E2E', () => {
  const testTitle = `E2E-Agent-${Date.now()}`;
  const testDescription = 'Created by E2E test';
  let createdId: string;

  // ── list ──────────────────────────────────────────────

  describe('list', () => {
    it('should list agents in table format', () => {
      const output = run('agent list');
      expect(output).toBeTruthy();
    });

    it('should output JSON', () => {
      const list = runJson<any[]>('agent list --json id,title');
      expect(Array.isArray(list)).toBe(true);
    });

    it('should respect limit option', () => {
      const list = runJson<any[]>('agent list --json id -L 3');
      expect(list.length).toBeLessThanOrEqual(3);
    });
  });

  // ── create ────────────────────────────────────────────

  describe('create', () => {
    it('should create an agent', () => {
      const output = run(`agent create -t "${testTitle}" -d "${testDescription}"`);
      expect(output).toContain('Created agent');

      const match = output.match(/Created agent\s+(\S+)/);
      expect(match).not.toBeNull();
      createdId = match![1];
    });
  });

  // ── view ──────────────────────────────────────────────

  describe('view', () => {
    it('should view agent details', () => {
      const output = run(`agent view ${createdId}`);
      expect(output).toContain(testTitle);
    });

    it('should output JSON', () => {
      const result = runJson<{ title: string }>(`agent view ${createdId} --json title,description`);
      expect(result.title).toBe(testTitle);
    });
  });

  // ── edit ──────────────────────────────────────────────

  describe('edit', () => {
    const updatedTitle = `${testTitle}-Updated`;

    it('should update agent title', () => {
      const output = run(`agent edit ${createdId} -t "${updatedTitle}"`);
      expect(output).toContain('Updated agent');
    });

    it('should reflect updates when viewed', () => {
      const result = runJson<{ title: string }>(`agent view ${createdId} --json title`);
      expect(result.title).toBe(updatedTitle);
    });

    it('should error when no changes specified', () => {
      expect(() => run(`agent edit ${createdId}`)).toThrow();
    });
  });

  // ── duplicate ─────────────────────────────────────────

  describe('duplicate', () => {
    let duplicatedId: string;

    it('should duplicate an agent', () => {
      const output = run(`agent duplicate ${createdId}`);
      expect(output).toContain('Duplicated agent');

      const match = output.match(/→\s+(\S+)/);
      if (match) duplicatedId = match[1];
    });

    it('should clean up duplicate', () => {
      if (duplicatedId) {
        const output = run(`agent delete ${duplicatedId} --yes`);
        expect(output).toContain('Deleted agent');
      }
    });
  });

  // ── delete (cleanup) ──────────────────────────────────

  describe('delete', () => {
    it('should delete the agent', () => {
      const output = run(`agent delete ${createdId} --yes`);
      expect(output).toContain('Deleted agent');
      expect(output).toContain(createdId);
    });
  });
});



================================================
FILE: apps/cli/e2e/doc.e2e.test.ts
================================================
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * E2E tests for `lh doc` document management commands.
 *
 * Prerequisites:
 * - `lh` CLI is installed and linked globally
 * - User is authenticated (`lh login` completed)
 * - Network access to the LobeHub server
 *
 * These tests create real documents, verify CRUD operations, then clean up.
 */

const CLI = process.env.LH_CLI_PATH || 'lh';
const TIMEOUT = 30_000;

function run(args: string): string {
  return execSync(`${CLI} ${args}`, {
    encoding: 'utf-8',
    env: { ...process.env, PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}` },
    timeout: TIMEOUT,
  }).trim();
}

function runJson<T = any>(args: string): T {
  const output = run(args);
  return JSON.parse(output) as T;
}

function extractDocId(output: string): string {
  const idMatch = output.match(/(docs_\w+)/);
  expect(idMatch).not.toBeNull();
  return idMatch![1];
}

describe('lh doc - E2E', () => {
  const testTitle = `E2E-Doc-${Date.now()}`;
  const testBody = 'Created by E2E test';
  let createdId: string;

  // ── create ────────────────────────────────────────────

  describe('create', () => {
    it('should create a document with title and body', () => {
      const output = run(`doc create -t "${testTitle}" -b "${testBody}"`);
      expect(output).toContain('Created document');
      createdId = extractDocId(output);
    });

    it('should appear in the list', () => {
      const list = runJson<{ id: string; title: string }[]>('doc list --json id,title');
      const found = list.find((d) => d.id === createdId);
      expect(found).toBeDefined();
      expect(found!.title).toBe(testTitle);
    });
  });

  // ── list ──────────────────────────────────────────────

  describe('list', () => {
    it('should list documents in table format', () => {
      const output = run('doc list');
      expect(output).toContain('ID');
      expect(output).toContain('TITLE');
    });

    it('should output JSON with field filtering', () => {
      const list = runJson<{ id: string; title: string }[]>('doc list --json id,title');
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBeGreaterThan(0);
      const first = list[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('title');
      expect(first).not.toHaveProperty('content');
    });

    it('should respect --limit flag', () => {
      const list = runJson<any[]>('doc list --json id -L 1');
      expect(list.length).toBeLessThanOrEqual(1);
    });

    it('should filter by --file-type', () => {
      const output = run('doc list --file-type custom/document --json id');
      const list = JSON.parse(output);
      expect(Array.isArray(list)).toBe(true);
    });

    it('should filter by --source-type', () => {
      const output = run('doc list --source-type api --json id');
      const list = JSON.parse(output);
      expect(Array.isArray(list)).toBe(true);
    });
  });

  // ── view ──────────────────────────────────────────────

  describe('view', () => {
    it('should view document details', () => {
      const output = run(`doc view ${createdId}`);
      expect(output).toContain(testTitle);
    });

    it('should output JSON with --json flag', () => {
      const result = runJson<{ id: string; title: string }>(
        `doc view ${createdId} --json id,title`,
      );
      expect(result.id).toBe(createdId);
      expect(result.title).toBe(testTitle);
    });
  });

  // ── edit ──────────────────────────────────────────────

  describe('edit', () => {
    const updatedTitle = `${testTitle}-Updated`;
    const updatedBody = 'Updated by E2E test';

    it('should update document title', () => {
      const output = run(`doc edit ${createdId} -t "${updatedTitle}"`);
      expect(output).toContain('Updated document');
      expect(output).toContain(createdId);
    });

    it('should reflect title update when viewed', () => {
      const result = runJson<{ title: string }>(`doc view ${createdId} --json title`);
      expect(result.title).toBe(updatedTitle);
    });

    it('should update document body', () => {
      const output = run(`doc edit ${createdId} -b "${updatedBody}"`);
      expect(output).toContain('Updated document');
    });

    it('should reflect body update when viewed', () => {
      const result = runJson<{ content: string }>(`doc view ${createdId} --json content`);
      expect(result.content).toBe(updatedBody);
    });

    it('should update body from file with --body-file', () => {
      const tmpFile = path.join(os.tmpdir(), `e2e-doc-body-${Date.now()}.md`);
      fs.writeFileSync(tmpFile, '# File Content\nFrom body-file flag');

      try {
        const output = run(`doc edit ${createdId} -F "${tmpFile}"`);
        expect(output).toContain('Updated document');

        const result = runJson<{ content: string }>(`doc view ${createdId} --json content`);
        expect(result.content).toContain('File Content');
      } finally {
        fs.unlinkSync(tmpFile);
      }
    });

    it('should update file type with --file-type', () => {
      const output = run(`doc edit ${createdId} --file-type custom/document`);
      expect(output).toContain('Updated document');

      const result = runJson<{ fileType: string }>(`doc view ${createdId} --json fileType`);
      expect(result.fileType).toBe('custom/document');
    });

    it('should error when no changes specified', () => {
      expect(() => run(`doc edit ${createdId}`)).toThrow();
    });
  });

  // ── create with options ────────────────────────────────

  describe('create with options', () => {
    let childDocId: string;

    it('should create a document with --slug', () => {
      const slug = `e2e-slug-${Date.now()}`;
      const output = run(`doc create -t "E2E-Slug-Doc" --slug "${slug}"`);
      expect(output).toContain('Created document');
      childDocId = extractDocId(output);
    });

    it('should create a document with --file-type', () => {
      const output = run(`doc create -t "E2E-Typed-Doc" --file-type custom/document`);
      expect(output).toContain('Created document');
      const id = extractDocId(output);

      const result = runJson<{ fileType: string }>(`doc view ${id} --json fileType`);
      expect(result.fileType).toBe('custom/document');

      run(`doc delete ${id} --yes`);
    });

    it('should create a document from file with --body-file', () => {
      const tmpFile = path.join(os.tmpdir(), `e2e-doc-create-${Date.now()}.md`);
      fs.writeFileSync(tmpFile, '# Created from file\nTest content');

      try {
        const output = run(`doc create -t "E2E-FromFile" -F "${tmpFile}"`);
        expect(output).toContain('Created document');
        const id = extractDocId(output);
        run(`doc delete ${id} --yes`);
      } finally {
        fs.unlinkSync(tmpFile);
      }
    });

    // Clean up the slug doc
    it('should clean up slug doc', () => {
      if (childDocId) {
        const output = run(`doc delete ${childDocId} --yes`);
        expect(output).toContain('Deleted');
      }
    });
  });

  // ── batch-create ──────────────────────────────────────

  describe('batch-create', () => {
    let batchDocIds: string[] = [];

    it('should batch create documents from JSON file', () => {
      const tmpFile = path.join(os.tmpdir(), `e2e-batch-${Date.now()}.json`);
      const docs = [
        { title: `E2E-Batch-1-${Date.now()}`, content: 'batch content 1' },
        { title: `E2E-Batch-2-${Date.now()}`, content: 'batch content 2' },
      ];
      fs.writeFileSync(tmpFile, JSON.stringify(docs));

      try {
        const output = run(`doc batch-create "${tmpFile}"`);
        expect(output).toContain('Created 2 document(s)');

        // Extract IDs from output
        const matches = output.matchAll(/(docs_\w+)/g);
        batchDocIds = [...matches].map((m) => m[1]);
        expect(batchDocIds.length).toBe(2);
      } finally {
        fs.unlinkSync(tmpFile);
      }
    });

    it('should clean up batch created docs', () => {
      if (batchDocIds.length > 0) {
        const output = run(`doc delete ${batchDocIds.join(' ')} --yes`);
        expect(output).toContain('Deleted');
      }
    });
  });

  // ── delete (cleanup) ──────────────────────────────────

  describe('delete', () => {
    it('should delete the document', () => {
      const output = run(`doc delete ${createdId} --yes`);
      expect(output).toContain('Deleted');
    });

    it('should no longer appear in the list', () => {
      const list = runJson<{ id: string }[]>('doc list --json id');
      const found = list.find((d) => d.id === createdId);
      expect(found).toBeUndefined();
    });
  });

  // ── delete multiple ───────────────────────────────────

  describe('delete multiple', () => {
    let docId1: string;
    let docId2: string;

    it('should create two documents for batch delete', () => {
      const output1 = run(`doc create -t "E2E-BatchDel-1" -b "batch test 1"`);
      docId1 = extractDocId(output1);

      const output2 = run(`doc create -t "E2E-BatchDel-2" -b "batch test 2"`);
      docId2 = extractDocId(output2);
    });

    it('should delete multiple documents at once', () => {
      const output = run(`doc delete ${docId1} ${docId2} --yes`);
      expect(output).toContain('Deleted 2');
    });
  });
});



================================================
FILE: apps/cli/e2e/file.e2e.test.ts
================================================
import { execSync } from 'node:child_process';

import { describe, expect, it } from 'vitest';

/**
 * E2E tests for `lh file` file management commands.
 *
 * Prerequisites:
 * - `lh` CLI is installed and linked globally
 * - User is authenticated (`lh login` completed)
 * - Network access to the LobeHub server
 */

const CLI = process.env.LH_CLI_PATH || 'lh';
const TIMEOUT = 30_000;

function run(args: string): string {
  return execSync(`${CLI} ${args}`, {
    encoding: 'utf-8',
    env: { ...process.env, PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}` },
    timeout: TIMEOUT,
  }).trim();
}

function runJson<T = any>(args: string): T {
  const output = run(args);
  return JSON.parse(output) as T;
}

describe('lh file - E2E', () => {
  // ── list ──────────────────────────────────────────────

  describe('list', () => {
    it('should list files in table format', () => {
      const output = run('file list');
      // Either table or "No files found."
      expect(output).toBeTruthy();
    });

    it('should output JSON', () => {
      const list = runJson<any[]>('file list --json id,name');
      expect(Array.isArray(list)).toBe(true);
      if (list.length > 0) {
        expect(list[0]).toHaveProperty('id');
        expect(list[0]).toHaveProperty('name');
      }
    });

    it('should accept limit option', () => {
      // Backend may not strictly enforce limit; verify it doesn't error
      const list = runJson<any[]>('file list --json id -L 5');
      expect(Array.isArray(list)).toBe(true);
    });
  });

  // ── view ──────────────────────────────────────────────

  describe('view', () => {
    it('should show file details if files exist', () => {
      const list = runJson<{ id: string }[]>('file list --json id -L 1');
      if (list.length > 0) {
        const output = run(`file view ${list[0].id}`);
        expect(output).toBeTruthy();
      }
    });

    it('should output JSON for file detail', () => {
      const list = runJson<{ id: string }[]>('file list --json id -L 1');
      if (list.length > 0) {
        const result = runJson(`file view ${list[0].id} --json id,name`);
        expect(result).toHaveProperty('id');
      }
    });

    it('should error for nonexistent file', () => {
      expect(() => run('file view nonexistent-file-xyz')).toThrow();
    });
  });

  // ── recent ──────────────────────