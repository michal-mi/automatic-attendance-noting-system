package com.example.presenceqr.interfaces;

public interface AsyncPostResponse {
    void onPostExecute(String responseJsonString, int responseCode);
}
