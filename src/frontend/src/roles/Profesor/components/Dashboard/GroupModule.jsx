"use client"

import { useState } from "react"
import { useStudentsData } from "../../hooks/useStudentsData"
import { Download, Search } from "lucide-react"

export default function GroupModule({ course, group }) {
  const { students, isLoading, error } = useStudentsData(course?.id, group?.id)
  const [searchTerm, setSearchTerm] = useState("")

  const handleDownloadPDF = () => {
    // In a real application, this would generate a PDF
    alert("Downloading student list as PDF...")
  }

  // Filter students based on search term
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="group-module">
        <div className="loading-state">Loading student data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="group-module">
        <div className="error-state">{error}</div>
      </div>
    )
  }

  if (!course || !group) {
    return (
      <div className="group-module">
        <div className="empty-state">Please select a course and group to view student information.</div>
      </div>
    )
  }

  return (
    <div className="group-module">
      <div className="group-header">
        <h2 className="group-title">
          Students in {group.name} <span className="course-name">({course.name})</span>
        </h2>
        <div className="group-actions">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search students..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-download" onClick={handleDownloadPDF} disabled={students.length === 0}>
            <Download size={16} />
            Download PDF
          </button>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="empty-state">No students found in this group.</div>
      ) : (
        <>
          <div className="student-count">
            Showing {filteredStudents.length} of {students.length} students
          </div>
          <div className="student-table-container">
            <table className="student-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="student-id">{student.id}</td>
                    <td className="student-name">{student.name}</td>
                    <td className="student-email">{student.email}</td>
                    <td className="student-phone">{student.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
