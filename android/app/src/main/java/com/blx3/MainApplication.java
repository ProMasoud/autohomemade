package com.blx3;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.BV.LinearGradient.LinearGradientPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.tkporter.sendsms.SendSMSPackage;
import com.avishayil.rnrestart.ReactNativeRestartPackage;
import com.cmcewen.blurview.BlurViewPackage;
import com.rusel.RCTBluetoothSerial.RCTBluetoothSerialPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.remobile.toast.RCTToastPackage;
import org.pgsqlite.SQLitePluginPackage;


import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new LinearGradientPackage(),
          new SQLitePluginPackage(),
            new SplashScreenReactPackage(),
            SendSMSPackage.getInstance(),
            new ReactNativeRestartPackage(),
            new BlurViewPackage(),
            new RCTToastPackage(),
          new RCTBluetoothSerialPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
