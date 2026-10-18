# Localização de URL e Código-Fonte do Android (FortuneGo)

## 📌 Onde Fica a URL da Plataforma?
O endereço da web que o aplicativo abre fica localizado no arquivo:
📂 `app/src/main/java/com/fortunego/apostas/MainActivity.java`

Linha 37:
```java
// URL Principal Ativa da Plataforma FortuneGo
public static final String DEFAULT_URL = "https://ais-dev-tr3y7zuvgoc4h76vlsm4ui-406707449082.us-east1.run.app";

// Versão Offline Embutida (roda 100% sem internet)
public static final String OFFLINE_URL = "file:///android_asset/www/index.html";
```

### ⚙️ Como alterar a URL direto no seu celular:
Você não precisa recompilar o APK para testar outra URL!
1. Abra o app FortuneGo no seu celular.
2. Dê um **toque longo de 2 segundos** na tela.
3. Abrirá a janela **"Localização de URL do FortuneGo"**.
4. Digite qualquer URL que desejar (ex: `https://seu-dominio.com.br`) e clique em **Salvar e Conectar**.
5. Se quiser voltar para a URL oficial, basta clicar em **URL Padrão**.

### 🌍 Permissões de Geolocalização (GPS)
Configuradas no `AndroidManifest.xml` e no `WebChromeClient`:
- `android.permission.ACCESS_FINE_LOCATION`
- `android.permission.ACCESS_COARSE_LOCATION`
- `settings.setGeolocationEnabled(true)`
- `onGeolocationPermissionsShowPrompt()` ativado automaticamente!
