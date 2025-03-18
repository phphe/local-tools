export function useCheckBrowserSupportForImage() {
  const { t } = useI18n();
  const isSupported = ref(true);
  const errorMessage = ref("");

  const checkSupport = () => {
    const requirements = {
      canvas: !!document.createElement("canvas").getContext,
      blob: "Blob" in window,
      url: "URL" in window,
      arrayBuffer: "ArrayBuffer" in window,
      imageData: "ImageData" in window,
    };

    const unsupported = Object.entries(requirements)
      .filter(([, supported]) => !supported)
      .map(([name]) => name);

    if (unsupported.length > 0) {
      isSupported.value = false;
      errorMessage.value = t("browserNotSupported");
      console.warn("Browser missing required features:", unsupported);
      alert(errorMessage.value);
      return false;
    }

    return true;
  };

  onMounted(() => {
    checkSupport();
  });

  return {
    isSupported,
    errorMessage,
    checkSupport,
  };
}
