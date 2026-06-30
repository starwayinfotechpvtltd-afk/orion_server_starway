import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// verify token
export const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid Token" });
  }
};

// admin token
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Access Denied" });
  next();
};

// admin or hr token
export const isAdminOrHr = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "hr")
    return res.status(403).json({ message: "Access Denied" });
  next();
};

// lead privacy masking for HR
export const maskLeadDataForHr = (req, res, next) => {
  if (req.user && req.user.role === "hr") {
    const originalJson = res.json;
    res.json = function (data) {
      const maskString = (str) => {
        if (!str) return "";
        const atIdx = str.indexOf("@");
        if (atIdx !== -1) {
          const namePart = str.slice(0, atIdx);
          const domainPart = str.slice(atIdx);
          return namePart.slice(0, Math.min(2, namePart.length)) + "****" + domainPart;
        }
        return str.slice(0, Math.min(3, str.length)) + "******" + str.slice(-2);
      };

      const maskLead = (lead) => {
        if (!lead) return lead;
        const leadObj = lead.toObject ? lead.toObject() : lead;
        return {
          ...leadObj,
          email: leadObj.email ? maskString(leadObj.email) : undefined,
          phoneNumber: leadObj.phoneNumber ? maskString(leadObj.phoneNumber) : undefined
        };
      };

      if (Array.isArray(data)) {
        data = data.map(maskLead);
      } else if (data && typeof data === "object") {
        if (data.leads && Array.isArray(data.leads)) {
          data.leads = data.leads.map(maskLead);
        } else if (data.closedLeads && Array.isArray(data.closedLeads)) {
          data.closedLeads = data.closedLeads.map(maskLead);
        } else if (data.newLeads && Array.isArray(data.newLeads)) {
          data.newLeads = data.newLeads.map(maskLead);
        } else if (data._id) {
          data = maskLead(data);
        }
      }
      return originalJson.call(this, data);
    };
  }
  next();
};

export default { verifyToken, isAdmin, isAdminOrHr, maskLeadDataForHr };
