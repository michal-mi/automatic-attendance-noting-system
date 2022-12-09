package com.example.presenceqr.viewholders;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;

import com.example.presenceqr.MainActivity;

public class ErrorManager {
    public static void ManageErrorResponseCode(int responseCode, Context context){
        if(responseCode == 400){
            AlertDialog.Builder alertDialog = new AlertDialog.Builder(context);
            alertDialog.setTitle("Błąd żądania");
            alertDialog.setMessage("Błędne dane żądania.");
            AlertDialog dialog = alertDialog.create();
            dialog.show();
        }
        if(responseCode == 401){
            AlertDialog.Builder alertDialog = new AlertDialog.Builder(context);
            alertDialog.setTitle("Nieautoryzowanany dostęp");
            alertDialog.setCancelable(false);
            alertDialog.setMessage("Wystąpił błąd autoryzacji użytkownika. Zaloguj się ponownie, a jeśli błąd będzie się dalej pojawiać skontaktuj się z administracją.");
            alertDialog.setPositiveButton("Ok", new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialogInterface, int i) {
                    dialogInterface.dismiss();
                    Intent intent = new Intent(context, MainActivity.class);
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK
                            | Intent.FLAG_ACTIVITY_CLEAR_TOP
                            | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                    context.startActivity(intent);
                }
            });
            AlertDialog dialog = alertDialog.create();
            dialog.show();
        }
        if(responseCode == 500){
            AlertDialog.Builder alertDialog = new AlertDialog.Builder(context);
            alertDialog.setTitle("Błąd serwera");
            alertDialog.setMessage("Wewnętrzny błąd serwera.");
            AlertDialog dialog = alertDialog.create();
            dialog.show();
        }
    }
}
