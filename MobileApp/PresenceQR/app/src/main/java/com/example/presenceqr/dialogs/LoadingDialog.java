package com.example.presenceqr.dialogs;

import android.app.Activity;
import android.app.AlertDialog;
import android.view.LayoutInflater;

import com.example.presenceqr.R;

public class LoadingDialog {
    Activity activity;
    AlertDialog dialog;

    LoadingDialog(Activity activity){
        this.activity = activity;
    }

    public void startDialog(){
        AlertDialog.Builder builder = new AlertDialog.Builder(activity);
        LayoutInflater layoutInflater = activity.getLayoutInflater();
        builder.setView(layoutInflater.inflate(R.layout.loading_screen, null));
        builder.setCancelable(false);
        dialog = builder.create();
        dialog.show();
    }
    public void stopDialog(){
        dialog.dismiss();
    }
}
