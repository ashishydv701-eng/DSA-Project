#include "crow/app.h"
#include "crow/json.h"
#include "crow/middlewares/cors.h"

#include <queue>
#include <unordered_map>
#include <string>

using namespace std;

// ===================== Patient =====================
struct Patient {
    int id;
    string name;
    int age;
    int severity;
};

// Comparator for priority queue (max severity first)
struct Compare {
    bool operator()(const Patient& a, const Patient& b) {
        return a.severity < b.severity;
    }
};

// ===================== Storage =====================
queue<int> fifoQueue;                         // stores IDs
priority_queue<Patient, vector<Patient>, Compare> pq;
unordered_map<int, Patient> patients;        // id -> patient

int currentId = 1;

// ===================== Helper =====================
crow::json::wvalue patientToJson(const Patient& p) {
    crow::json::wvalue x;
    x["id"] = p.id;
    x["name"] = p.name;
    x["age"] = p.age;
    x["severity"] = p.severity;
    return x;
}

// ===================== MAIN =====================
int main() {

    crow::App<crow::CORSHandler> app;

    // ✅ Proper CORS
    auto& cors = app.get_middleware<crow::CORSHandler>();
    cors.global()
        .origin("*")
        .methods("GET"_method, "POST"_method)
        .headers("Content-Type");

    // ===================== ADD PATIENT =====================
    CROW_ROUTE(app, "/add").methods("POST"_method)
    ([](const crow::request& req) {

        auto data = crow::json::load(req.body);
        if (!data) return crow::response(400, "Invalid JSON");

        Patient p;
        p.id = currentId++;
        p.name = string(data["name"].s());
        p.age = data["age"].i();
        p.severity = data["severity"].i();

        patients[p.id] = p;
        fifoQueue.push(p.id);
        pq.push(p);

        crow::json::wvalue res;
        res["message"] = "Patient added";
        res["id"] = p.id;

        return crow::response(res);
    });

    // ===================== GET ALL PATIENTS =====================
    CROW_ROUTE(app, "/patients")
    ([]() {
        crow::json::wvalue result;

        int i = 0;
        for (auto& [id, p] : patients) {
            result[i++] = patientToJson(p);
        }

        return crow::response(result);
    });

    // ===================== FIFO TREAT =====================
    CROW_ROUTE(app, "/treat/fifo")
    ([]() {

        while (!fifoQueue.empty()) {
            int id = fifoQueue.front();
            fifoQueue.pop();

            // skip if already treated
            if (patients.count(id)) {
                Patient p = patients[id];
                patients.erase(id);

                crow::json::wvalue res = patientToJson(p);
                res["type"] = "FIFO";
                return crow::response(res);
            }
        }

        return crow::response(400, "Queue empty");
    });

    // ===================== PRIORITY TREAT =====================
    CROW_ROUTE(app, "/treat/priority")
    ([]() {

        while (!pq.empty()) {
            Patient p = pq.top();
            pq.pop();

            // skip if already treated
            if (patients.count(p.id)) {
                patients.erase(p.id);

                crow::json::wvalue res = patientToJson(p);
                res["type"] = "PRIORITY";
                return crow::response(res);
            }
        }

        return crow::response(400, "Queue empty");
    });

    // ===================== RUN =====================
    app.port(18080).multithreaded().run();
}