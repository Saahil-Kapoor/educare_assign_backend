// server.js
import express from 'express';
import bodyParser from 'body-parser';
import { z } from 'zod';
import db from './db.js';
import dotenv from 'dotenv';
dotenv.config();



const app = express();
app.use(bodyParser.json());

const addSchoolSchema = z.object({
    name: z.string().min(1, "Name is required"),
    address: z.string().min(1, "Address is required"),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
});

const listSchoolsSchema = z.object({
    latitude: z.preprocess(val => parseFloat(val), z.number().min(-90).max(90)),
    longitude: z.preprocess(val => parseFloat(val), z.number().min(-180).max(180))
});

app.post('/addSchool', (req, res) => {
    const parsed = addSchoolSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.format() });
    }

    const { name, address, latitude, longitude } = parsed.data;

    const sql = "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, address, latitude, longitude], (err, result) => {
        if (err) throw err;
        res.json({ message: "School added successfully", id: result.insertId });
    });
});

app.get('/listSchools', (req, res) => {
    const parsed = listSchoolsSchema.safeParse(req.query);

    if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.format() });
    }

    const { latitude: userLat, longitude: userLng } = parsed.data;

    db.query("SELECT * FROM schools", (err, results) => {
        if (err) throw err;

        const R = 6371; //for km
        results.forEach(school => {
            const dLat = (school.latitude - userLat) * Math.PI / 180;
            const dLng = (school.longitude - userLng) * Math.PI / 180;
            const a = Math.sin(dLat / 2) ** 2 +
                      Math.cos(userLat * Math.PI / 180) * Math.cos(school.latitude * Math.PI / 180) *
                      Math.sin(dLng / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            school.distance_km = R * c;
        });

        results.sort((a, b) => a.distance_km - b.distance_km);

        res.json(results);
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
    
});
