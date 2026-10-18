package com.fortunego.apostas;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.GeolocationPermissions;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends Activity {

    // URL Principal Ativa da Plataforma FortuneGo
    public static final String DEFAULT_URL = "https://ais-dev-tr3y7zuvgoc4h76vlsm4ui-406707449082.us-east1.run.app";
    // URL Embutida Offline (funciona mesmo sem servidor)
    public static final String OFFLINE_URL = "file:///android_asset/www/index.html";

    private static final String PREFS_NAME = "FortuneGoPrefs";
    private static final String KEY_CUSTOM_URL = "target_url";
    private static final int PERMISSION_REQUEST_LOCATION = 1001;

    private WebView webView;
    private FrameLayout rootLayout;
    private LinearLayout errorLayout;
    private TextView errorTextView;
    private SharedPreferences prefs;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        );
        getWindow().setBackgroundDrawableResource(android.R.color.black);

        prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);

        // Solicitar permissoes de localizacao necessarias para apostas
        requestLocationPermissions();

        rootLayout = new FrameLayout(this);
        rootLayout.setBackgroundColor(Color.parseColor("#020617"));
        rootLayout.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));

        initWebView();
        initErrorView();

        rootLayout.addView(webView);
        rootLayout.addView(errorLayout);

        // Botao discreto para configurar URL (toque longo ou duplo)
        initFloatingSettingsTrigger();

        setContentView(rootLayout);

        // Carrega a URL configurada
        loadTargetUrl();
    }

    private void requestLocationPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            String[] permissions = new String[]{
                "android.permission.ACCESS_FINE_LOCATION",
                "android.permission.ACCESS_COARSE_LOCATION"
            };
            boolean hasPermission = checkSelfPermission(permissions[0]) == PackageManager.PERMISSION_GRANTED;
            if (!hasPermission) {
                requestPermissions(permissions, PERMISSION_REQUEST_LOCATION);
            }
        }
    }

    private void initWebView() {
        webView = new WebView(this);
        webView.setLayoutParams(new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ));
        webView.setBackgroundColor(Color.parseColor("#020617"));

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        try {
            settings.setAllowFileAccessFromFileURLs(true);
            settings.setAllowUniversalAccessFromFileURLs(true);
        } catch (Exception ignored) {}

        // Geolocalizacao ativa
        settings.setGeolocationEnabled(true);
        settings.setGeolocationDatabasePath(getFilesDir().getPath());

        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        settings.setUserAgentString(
            settings.getUserAgentString() + " FortuneGoAndroid/1.0 (Mobile; NativeApp)"
        );

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                // Concede permissao de geolocalizacao para a URL da plataforma
                callback.invoke(origin, true, false);
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url.startsWith("tel:") || url.startsWith("mailto:") || url.startsWith("whatsapp:") || url.startsWith("intent:")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        return false;
                    }
                }
                return false;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                hideErrorView();
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                super.onReceivedError(view, errorCode, description, failingUrl);
                showErrorView("Falha ao carregar URL (" + errorCode + "):\n" + failingUrl + "\n" + description);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request.isForMainFrame()) {
                    showErrorView("Erro de conexão:\n" + request.getUrl().toString());
                }
            }
        });
    }

    private void initErrorView() {
        errorLayout = new LinearLayout(this);
        errorLayout.setOrientation(LinearLayout.VERTICAL);
        errorLayout.setGravity(Gravity.CENTER);
        errorLayout.setBackgroundColor(Color.parseColor("#020617"));
        errorLayout.setPadding(40, 40, 40, 40);
        errorLayout.setLayoutParams(new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ));
        errorLayout.setVisibility(View.GONE);

        errorTextView = new TextView(this);
        errorTextView.setTextColor(Color.parseColor("#f87171"));
        errorTextView.setTextSize(14);
        errorTextView.setGravity(Gravity.CENTER);
        errorTextView.setPadding(0, 0, 0, 30);
        errorLayout.addView(errorTextView);

        Button btnRetry = new Button(this);
        btnRetry.setText("Tentar Novamente");
        btnRetry.setBackgroundColor(Color.parseColor("#10b981"));
        btnRetry.setTextColor(Color.parseColor("#020617"));
        btnRetry.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                hideErrorView();
                loadTargetUrl();
            }
        });
        errorLayout.addView(btnRetry);

        Button btnOffline = new Button(this);
        btnOffline.setText("Abrir Modo Offline (Embutido)");
        btnOffline.setBackgroundColor(Color.parseColor("#1e293b"));
        btnOffline.setTextColor(Color.parseColor("#38bdf8"));
        btnOffline.setPadding(0, 20, 0, 20);
        btnOffline.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                hideErrorView();
                webView.loadUrl(OFFLINE_URL);
            }
        });
        errorLayout.addView(btnOffline);

        Button btnConfig = new Button(this);
        btnConfig.setText("Configurar Localização de URL");
        btnConfig.setBackgroundColor(Color.parseColor("#334155"));
        btnConfig.setTextColor(Color.WHITE);
        btnConfig.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                showUrlConfigDialog();
            }
        });
        errorLayout.addView(btnConfig);
    }

    private void showErrorView(String msg) {
        if (errorTextView != null) {
            errorTextView.setText(msg);
        }
        if (errorLayout != null) {
            errorLayout.setVisibility(View.VISIBLE);
        }
    }

    private void hideErrorView() {
        if (errorLayout != null) {
            errorLayout.setVisibility(View.GONE);
        }
    }

    private void initFloatingSettingsTrigger() {
        // Um toque longo de 3 segundos na tela ou no topo permite abrir a configuracao de URL
        rootLayout.setOnLongClickListener(new View.OnLongClickListener() {
            @Override
            public boolean onLongClick(View v) {
                showUrlConfigDialog();
                return true;
            }
        });
    }

    public void showUrlConfigDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Localização de URL do FortuneGo");

        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(40, 20, 40, 20);

        TextView infoText = new TextView(this);
        infoText.setText("Defina o endereço (URL) da plataforma ou utilize a versão offline embutida:");
        infoText.setTextColor(Color.DKGRAY);
        layout.addView(infoText);

        final EditText input = new EditText(this);
        String currentUrl = prefs.getString(KEY_CUSTOM_URL, DEFAULT_URL);
        input.setText(currentUrl);
        input.setSingleLine(true);
        input.setSelectAllOnFocus(true);
        layout.addView(input);

        builder.setView(layout);

        builder.setPositiveButton("Salvar e Conectar", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                String newUrl = input.getText().toString().trim();
                if (newUrl.isEmpty()) {
                    newUrl = DEFAULT_URL;
                }
                prefs.edit().putString(KEY_CUSTOM_URL, newUrl).apply();
                Toast.makeText(MainActivity.this, "URL salva: " + newUrl, Toast.LENGTH_SHORT).show();
                hideErrorView();
                webView.loadUrl(newUrl);
            }
        });

        builder.setNeutralButton("URL Padrão", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                prefs.edit().putString(KEY_CUSTOM_URL, DEFAULT_URL).apply();
                Toast.makeText(MainActivity.this, "Restaurado para URL oficial", Toast.LENGTH_SHORT).show();
                hideErrorView();
                webView.loadUrl(DEFAULT_URL);
            }
        });

        builder.setNegativeButton("Modo Offline", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                prefs.edit().putString(KEY_CUSTOM_URL, OFFLINE_URL).apply();
                Toast.makeText(MainActivity.this, "Carregando app offline embutido", Toast.LENGTH_SHORT).show();
                hideErrorView();
                webView.loadUrl(OFFLINE_URL);
            }
        });

        builder.show();
    }

    private void loadTargetUrl() {
        String targetUrl = prefs.getString(KEY_CUSTOM_URL, DEFAULT_URL);
        webView.loadUrl(targetUrl);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
