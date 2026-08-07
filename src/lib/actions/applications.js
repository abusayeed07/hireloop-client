// src/lib/actions/applications.js
'use server';

import { serverMutation } from "../core/server";

// This function sends the data to the backend.
// serverMutation handles the proper Cookie forwarding automatically now!
export const submitApplication = async (applicationData) => {
    return serverMutation('/api/applications', applicationData);
}