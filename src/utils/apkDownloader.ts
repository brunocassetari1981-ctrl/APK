export async function triggerDirectApkDownload(): Promise<boolean> {
  try {
    const response = await fetch('/FortuneGo.apk');
    if (!response.ok) throw new Error('Status ' + response.status);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'FortuneGo.apk';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      window.URL.revokeObjectURL(url);
    }, 4000);

    return true;
  } catch (err) {
    console.warn('Falha no blob, redirecionando direto para /FortuneGo.apk:', err);
    window.location.href = '/FortuneGo.apk';
    return true;
  }
}
