import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Use dynamic import to avoid client-side import of server module
async function getSupabase() {
  const { supabase } = await import("@/integrations/supabase/client");
  return supabase;
}

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw new Error(error.message);
  return data;
});

export const getTests = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("tests")
    .select("*, categories(name)")
    .order("name");
  if (error) throw new Error(error.message);
  return data;
});

export const getDoctors = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from("doctors").select("*").order("name");
  if (error) throw new Error(error.message);
  return data;
});

export const getDoctorById = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => {
    const parsed = z.object({ id: z.string().uuid() }).parse(input);
    return parsed;
  })
  .handler(async ({ data }) => {
    const supabase = await getSupabase();
    const { data: doctor, error } = await supabase
      .from("doctors")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return doctor;
  });

export const createAppointment = createServerFn({ method: "POST" })
  .inputValidator((input: {
    patient_name: string;
    phone: string;
    doctor_id: string;
    service: string;
    date: string;
    time: string;
  }) => {
    const parsed = z.object({
      patient_name: z.string().min(2).max(100),
      phone: z.string().min(7).max(20).regex(/^[+\d\s()-]+$/),
      doctor_id: z.string().uuid(),
      service: z.string().min(1).max(200),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      time: z.string().min(1).max(10),
    }).parse(input);
    return parsed;
  })
  .handler(async ({ data }) => {
    const supabase = await getSupabase();
    const { error } = await supabase.from("appointments").insert(data);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const getServices = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("services")
    .select("*, categories(name)")
    .order("name");
  if (error) throw new Error(error.message);
  return data;
});
