package com.apple.android.music.playback.g;

import android.util.JsonReader;
import android.util.JsonToken;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

/**
 * Drop-in replacement for the webPlayback response parser inside Apple's MusicKit
 * playback SDK (mediaplayback-release-1.1.1.aar). The obfuscated name and package
 * must stay exactly as they are: the SDK calls {@code h.a(InputStream)} directly.
 *
 * Why it exists: the SDK's own parser reads "songId" with JsonReader.nextInt().
 * Apple Music now issues catalog IDs above Integer.MAX_VALUE (e.g. 6793086758), so
 * for those tracks the parse throws, the SDK swallows the failure and the player
 * sits in "buffering" forever without reporting an error. Reading the ID as a long
 * is the only behavioural change; everything else mirrors the original class.
 *
 * The original class is stripped from the AAR at build time (see the
 * "patchAppleSdkAar" task in android/app/build.gradle) so this one takes its place.
 */
public class h {

    public static g a(InputStream inputStream) throws IOException {
        JsonReader reader = new JsonReader(new BufferedReader(new InputStreamReader(inputStream)));
        try {
            List<b> assets = null;
            String failureType = "";
            String customerMessage = "";
            reader.beginObject();
            while (reader.hasNext()) {
                String name = reader.nextName();
                if (name.equals("songList")) {
                    assets = readSongList(reader);
                } else if (name.equals("failureType")) {
                    failureType = readString(reader, "");
                } else if (name.equals("customerMessage")) {
                    customerMessage = readString(reader, "");
                } else {
                    reader.skipValue();
                }
            }
            reader.endObject();
            return new g(assets, failureType, customerMessage);
        } finally {
            reader.close();
        }
    }

    private static List<b> readSongList(JsonReader reader) throws IOException {
        List<b> assets = null;
        String keyCertUrl = "";
        String keyServerUrl = "";
        long songId = 0L;
        reader.beginArray();
        reader.beginObject();
        while (reader.hasNext()) {
            String name = reader.nextName();
            if (name.equals("hls-key-cert-url")) {
                keyCertUrl = readString(reader, "");
            } else if (name.equals("hls-key-server-url")) {
                keyServerUrl = readString(reader, "");
            } else if (name.equals("songId")) {
                songId = readLong(reader, 0L);
            } else if (name.equals("assets")) {
                assets = readAssets(reader);
            } else {
                reader.skipValue();
            }
        }
        reader.endObject();
        reader.endArray();
        if (assets != null) {
            for (b asset : assets) {
                asset.a(keyCertUrl);
                asset.b(keyServerUrl);
                asset.a(songId);
            }
        }
        return assets;
    }

    private static List<b> readAssets(JsonReader reader) throws IOException {
        List<b> assets = new ArrayList<>();
        reader.beginArray();
        while (reader.hasNext()) {
            b asset = readAsset(reader);
            if (asset != null) {
                assets.add(asset);
            }
        }
        reader.endArray();
        return assets;
    }

    private static b readAsset(JsonReader reader) throws IOException {
        String flavor = "";
        String url = "";
        long fileSize = 0L;
        reader.beginObject();
        while (reader.hasNext()) {
            String name = reader.nextName();
            if (name.equals("flavor")) {
                flavor = readString(reader, "");
            } else if (name.equals("URL")) {
                url = readString(reader, "");
            } else if (name.equals("file-size")) {
                fileSize = readLong(reader, 0L);
            } else {
                reader.skipValue();
            }
        }
        reader.endObject();
        if (flavor.contains("cbcp")) {
            return new b(flavor, url, "", "", fileSize);
        }
        return null;
    }

    private static String readString(JsonReader reader, String fallback) throws IOException {
        if (reader.peek() != JsonToken.NULL) {
            return reader.nextString();
        }
        reader.skipValue();
        return fallback;
    }

    private static long readLong(JsonReader reader, long fallback) throws IOException {
        if (reader.peek() != JsonToken.NULL) {
            return reader.nextLong();
        }
        reader.skipValue();
        return fallback;
    }
}
