package com.ucab.grupo_113_ing_software.tpa_server.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "gps_coordinate")
public class CoordenadaGps {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;

    @Column(nullable = false)
    private double speed;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    public CoordenadaGps(long id, double latitude, double longitude, double speed, LocalDateTime timestamp) {
        this.id = id;
        this.latitude = latitude;
        this.longitude = longitude;
        this.speed = speed;
        this.timestamp = timestamp;
    }

    public CoordenadaGps(double latitude, double longitude, double speed) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.speed = speed;
        timestamp = LocalDateTime.now();
    }

    public CoordenadaGps() {
    }

    public CoordenadaGps(double latitude, double longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public double getLatitude() {
        return latitude;
    }

    public double getSpeed() {
        return speed;
    }

    public void setSpeed(double speed) {
        this.speed = speed;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public long getId() {
        return id;
    }
}