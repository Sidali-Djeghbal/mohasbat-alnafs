package org.mohasabat.nafs;

import android.content.Intent;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.JSObject;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(WidgetBridgePlugin.class);
        super.onCreate(savedInstanceState);
        handleWidgetIntent(getIntent(), false);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleWidgetIntent(intent, true);
    }

    private void handleWidgetIntent(Intent intent, boolean emitToWeb) {
        if (intent == null) {
            return;
        }

        String action = intent.getStringExtra(MohasbatWidgetProvider.EXTRA_QUICK_ACTION);
        if (action == null || action.isEmpty()) {
            return;
        }

        MohasbatWidgetProvider.setPendingQuickAction(this, action);

        if (emitToWeb && bridge != null) {
            JSObject payload = new JSObject();
            payload.put("action", action);
            bridge.triggerWindowJSEvent("widgetQuickAction", payload.toString());
        }
    }
}
