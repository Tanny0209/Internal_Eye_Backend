import mongoose from "mongoose";

/* ---------- Email Schema ---------- */
const EmailSchema = new mongoose.Schema(
  {
    email_id: String,
    date: Date,
    from_user: String,
    to_users: [String],
    cc_users: [String],
    bcc_users: [String],
    subject: String,
    body: String,
    text: String,

    attachment_count: Number,
    attachment_types: [String],
    email_size: Number,

    dataset_source: String,
    parse_error: Boolean,

    hour: Number,
    day_of_week: String,
    is_weekend: Boolean,
    is_after_hours: Boolean,

    from_domain: String,
    is_external: Boolean,
    num_recipients: Number,

    subject_length: Number,
    body_length: Number,

    contains_sensitive_keywords: Boolean,
    has_attachment: Boolean,
    suspicious_attachment: Boolean,
    is_attachment_only: Boolean,
    large_email: Boolean,
    new_contact_flag: Boolean,

    emails_sent_day: Number,
    avg_daily_emails: Number,

    intent: String,
    sentiment: String,

    risk_score: Number,
    risk_level: String,
    created_at: Date,
  },
  { _id: false }
);

/* ---------- Nested User Schema ---------- */
const NestedUserSchema = new mongoose.Schema(
  {
    user_id: String,
    name: String,
    email: String,
    role: String,

    emails: {
      type: Map,
      of: EmailSchema,
    },

    cached_user_graph_score_raw: Number,
    cached_user_graph_score: Number,

    user_risk_level: String,
    user_risk_score: Number,
  },
  { _id: false }
);

/* ---------- Main Document Schema ---------- */
const DepartmentSchema = new mongoose.Schema({
  department: String,
  created_at: Date,

  users: {
    type: Map,
    of: NestedUserSchema,
  },
});

export default mongoose.model("DepartmentData", DepartmentSchema);
