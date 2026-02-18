package org.mohasabat.nafs;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {

    @PluginMethod
    public void updateHomeWidget(PluginCall call) {
        int safeScore = clamp(call.getData().optInt("score", 0), 0, 100);
        int safePending = Math.max(0, call.getData().optInt("pending", 0));

        MohasbatWidgetProvider.updateWidgetState(getContext(), safeScore, safePending);
        call.resolve();
    }

    @PluginMethod
    public void getPendingQuickAction(PluginCall call) {
        JSObject result = new JSObject();
        result.put("action", MohasbatWidgetProvider.getPendingQuickAction(getContext()));
        call.resolve(result);
    }

    @PluginMethod
    public void consumePendingQuickAction(PluginCall call) {
        MohasbatWidgetProvider.clearPendingQuickAction(getContext());
        call.resolve();
    }

    private int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }
}
