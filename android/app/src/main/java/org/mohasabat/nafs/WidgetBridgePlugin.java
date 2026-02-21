package org.mohasabat.nafs;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONArray;

@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {

    @PluginMethod
    public void updateHomeWidget(PluginCall call) {
        int safeScore = clamp(call.getData().optInt("score", 0), 0, 100);
        int safePending = Math.max(0, call.getData().optInt("pending", 0));
        String nextPrayerName = safeText(call.getString("nextPrayerName"), "الصلاة القادمة");
        String nextPrayerCountdown = safeText(call.getString("nextPrayerCountdown"), "--:--");
        String nextPrayerTime = safeText(call.getString("nextPrayerTime"), "--:--");
        String adhkarPhase = safeText(call.getString("adhkarPhase"), "أذكار اليوم");
        boolean adhkarCompleted = call.getData().optBoolean("adhkarCompleted", false);

        MohasbatWidgetProvider.updateWidgetState(
            getContext(),
            safeScore,
            safePending,
            nextPrayerName,
            nextPrayerCountdown,
            nextPrayerTime,
            adhkarPhase,
            adhkarCompleted
        );
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

    @PluginMethod
    public void getPendingQuickActions(PluginCall call) {
        String[] actions = MohasbatWidgetProvider.getPendingQuickActions(getContext());
        JSONArray jsonActions = new JSONArray();
        for (String action : actions) {
            jsonActions.put(action);
        }

        JSObject result = new JSObject();
        result.put("actions", jsonActions);
        call.resolve(result);
    }

    @PluginMethod
    public void consumePendingQuickActions(PluginCall call) {
        MohasbatWidgetProvider.clearPendingQuickActions(getContext());
        call.resolve();
    }

    private int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }

    private String safeText(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) {
            return fallback;
        }
        return value;
    }
}
