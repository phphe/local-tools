<template>
  <div class="py-8">
    <h1 class="text-4xl font-bold text-center">{{ t("appName") }}</h1>
    <div class="mt-8 max-w-2xl mx-auto space-y-6 text-gray-600 dark:text-gray-300">
      <p class="text-lg">{{ t("siteIntro") }}</p>
      
      <div class="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg space-y-4">
        <h2 class="text-xl font-bold">{{ t("features") }}</h2>
        <ul class="list-disc list-inside space-y-2">
          <li>{{ t("feature1") }}</li>
          <li>{{ t("feature2") }}</li>
          <li>{{ t("feature3") }}</li>
          <li>{{ t("feature4") }}</li>
        </ul>
      </div>

      <div class="text-center">
        <p class="text-lg">{{ t("startGuide") }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
useSeoMeta({
  title: t("appName"),
  description: t("siteDescription"),
});
</script>

<i18n lang="yaml">
zh:
  siteIntro: "欢迎使用本站提供的在线工具！我们使用浏览器API开发了一系列实用的工具，让您可以方便地处理图片、音频等各种文件。"
  features: "主要特点"
  feature1: "完全免费，无需注册即可使用所有功能"
  feature2: "文件仅在浏览器本地处理，保护您的隐私"
  feature3: "使用浏览器原生API，快速且高效"
  feature4: "开源项目，代码透明可信"
  startGuide: "点击左侧菜单开始使用各种工具吧！"
en:
  siteIntro: "Welcome to our online tools! We have developed a series of useful tools using browser APIs for convenient processing of images, audio, and various files."
  features: "Key Features"
  feature1: "Completely free, no registration required"
  feature2: "Files are processed locally in your browser, protecting your privacy"
  feature3: "Using native browser APIs for fast and efficient processing"
  feature4: "Open source project with transparent code"
  startGuide: "Click the menu on the left to start using our tools!"
es:
  siteIntro: "¡Bienvenido a nuestras herramientas en línea! Hemos desarrollado una serie de herramientas útiles utilizando APIs del navegador para procesar imágenes, audio y varios archivos de manera conveniente."
  features: "Características Principales"
  feature1: "Completamente gratis, sin necesidad de registro"
  feature2: "Los archivos se procesan localmente en su navegador, protegiendo su privacidad"
  feature3: "Uso de APIs nativas del navegador para un procesamiento rápido y eficiente"
  feature4: "Proyecto de código abierto con código transparente"
  startGuide: "¡Haga clic en el menú de la izquierda para comenzar a usar nuestras herramientas!"
pt:
  siteIntro: "Bem-vindo às nossas ferramentas online! Desenvolvemos uma série de ferramentas úteis usando APIs do navegador para processamento conveniente de imagens, áudio e vários arquivos."
  features: "Recursos Principais"
  feature1: "Totalmente gratuito, sem necessidade de registro"
  feature2: "Os arquivos são processados localmente no seu navegador, protegendo sua privacidade"
  feature3: "Usando APIs nativas do navegador para processamento rápido e eficiente"
  feature4: "Projeto de código aberto com código transparente"
  startGuide: "Clique no menu à esquerda para começar a usar nossas ferramentas!"
id:
  siteIntro: "Selamat datang di alat online kami! Kami telah mengembangkan serangkaian alat berguna menggunakan API browser untuk memproses gambar, audio, dan berbagai file dengan mudah."
  features: "Fitur Utama"
  feature1: "Sepenuhnya gratis, tidak perlu registrasi"
  feature2: "File diproses secara lokal di browser Anda, melindungi privasi Anda"
  feature3: "Menggunakan API browser asli untuk pemrosesan yang cepat dan efisien"
  feature4: "Proyek open source dengan kode yang transparan"
  startGuide: "Klik menu di sebelah kiri untuk mulai menggunakan alat kami!"
fr:
  siteIntro: "Bienvenue sur nos outils en ligne ! Nous avons développé une série d'outils utiles utilisant les APIs du navigateur pour traiter facilement les images, l'audio et divers fichiers."
  features: "Caractéristiques Principales"
  feature1: "Entièrement gratuit, sans inscription nécessaire"
  feature2: "Les fichiers sont traités localement dans votre navigateur, protégeant votre confidentialité"
  feature3: "Utilisation des APIs natives du navigateur pour un traitement rapide et efficace"
  feature4: "Projet open source avec code transparent"
  startGuide: "Cliquez sur le menu à gauche pour commencer à utiliser nos outils !"
ja:
  siteIntro: "オンラインツールへようこそ！ブラウザAPIを使用して、画像、音声、その他のファイルを便利に処理できる一連の実用的なツールを開発しました。"
  features: "主な特徴"
  feature1: "完全無料、登録不要"
  feature2: "ファイルはブラウザでローカルに処理され、プライバシーを保護"
  feature3: "ブラウザネイティブAPIを使用した高速で効率的な処理"
  feature4: "透明性のあるオープンソースプロジェクト"
  startGuide: "左側のメニューをクリックしてツールの使用を開始しましょう！"
ru:
  siteIntro: "Добро пожаловать в наши онлайн-инструменты! Мы разработали ряд полезных инструментов с использованием API браузера для удобной обработки изображений, аудио и различных файлов."
  features: "Основные Характеристики"
  feature1: "Полностью бесплатно, без необходимости регистрации"
  feature2: "Файлы обрабатываются локально в вашем браузере, защищая вашу конфиденциальность"
  feature3: "Использование нативных API браузера для быстрой и эффективной обработки"
  feature4: "Проект с открытым исходным кодом"
  startGuide: "Нажмите на меню слева, чтобы начать использовать наши инструменты!"
de:
  siteIntro: "Willkommen bei unseren Online-Tools! Wir haben eine Reihe nützlicher Tools entwickelt, die Browser-APIs verwenden, um Bilder, Audio und verschiedene Dateien bequem zu verarbeiten."
  features: "Hauptmerkmale"
  feature1: "Völlig kostenlos, keine Registrierung erforderlich"
  feature2: "Dateien werden lokal in Ihrem Browser verarbeitet und schützen Ihre Privatsphäre"
  feature3: "Verwendung nativer Browser-APIs für schnelle und effiziente Verarbeitung"
  feature4: "Open-Source-Projekt mit transparentem Code"
  startGuide: "Klicken Sie auf das Menü links, um unsere Tools zu verwenden!"
</i18n>
