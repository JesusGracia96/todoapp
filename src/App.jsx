import { useState, useEffect } from "react";
import { Container, Col, Form, Button, Table, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTrash } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";

import "./App.css";

export default function App() {
  let [activities, setActivities] = useState([]);
  let [loading, setLoading] = useState(false);
  let [description, setDescription] = useState("");
  let [message, setMessage] = useState("");
  let [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/activities")
      .then((res) => res.json())
      .then((data) => {
        setActivities(data[0]);
        setLoading(false);
      });
  }, []);

  const handleChange = (event) => {
    setDescription(event.target.value);
  };

  const uploadActivity = (event) => {
    event.preventDefault();
    let newDescription = description;

    if (newDescription != "") {
      fetch("http://127.0.0.1:8000/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: newDescription,
        }),
      })
        .then((res) => res.json())
        .then((response) => {
          setLoading(true);
          fetch("http://127.0.0.1:8000/api/activities")
            .then((res) => res.json())
            .then((data) => {
              setActivities(data[0]);
              setLoading(false);
            });

          setMessage(response);
          setShowAlert(true);
        });
    }
  };

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  const handleDelete = (event) => {
    let activityId = parseInt(event.target.getAttribute("activityid"));

    fetch(`http://127.0.0.1:8000/api/activities/${activityId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((response) => {
        setLoading(true);
        fetch("http://127.0.0.1:8000/api/activities")
          .then((res) => res.json())
          .then((data) => {
            setActivities(data[0]);
            setLoading(false);
          });

        setMessage(response);
        setShowAlert(true);
        console.log(response);
      });
  };

  const handleComplete = (event) => {
    let activityId = parseInt(event.target.getAttribute("activityid"));

    fetch(`http://127.0.0.1:8000/api/activities/${activityId}`, {
      method: "PUT",
      headers: {
        'Content-Type': "application/json"
      },
    })
      .then(res => res.json())
      .then(data => {
        setLoading(true);
        fetch("http://127.0.0.1:8000/api/activities")
          .then((res) => res.json())
          .then((data) => {
            setActivities(data[0]);
            setLoading(false);
          });

        setMessage(data["message"]);
        setShowAlert(true);
      })
  }

  return (
    <Container className="align-all-center">
      <Alert
        show={showAlert}
        variant="success"
        onClose={handleAlertClose}
        className="float-alert"
        dismissible
      >
        {message}
      </Alert>
      <Form className="mb-3 add-activity-form">
        <Form.Group className="mb-3">
          <Form.Label>Activity: </Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter new activity to do"
            id="description"
            value={description}
            onChange={handleChange}
          ></Form.Control>
        </Form.Group>
        <Button variant="primary" type="submit" onClick={uploadActivity}>
          Add Activity
        </Button>
      </Form>

      {loading ? (
        <h2>Cargando...</h2>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Activity</th>
              <th>Status</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => {
              return (
                <tr key={activity.id}>
                  <td>
                    <Col xl={9}>{activity.description}</Col>
                  </td>
                  <td>
                    <Col xl={1}>
                      {activity.status == 1 ? "Pendiente" : "Completada"}
                    </Col>
                  </td>
                  <td>
                    <Col>
                      <div className="buttons">
                        {activity.status == 1
                          ? (
                            <>
                              <Button variant="success" activityid={activity.id} onClick={handleComplete}>
                                <FontAwesomeIcon
                                  icon={faCheck}
                                  className="mr-2"
                                ></FontAwesomeIcon>{" "}
                                Completar
                              </Button>
                              <Button
                                activityid={activity.id}
                                variant="danger"
                                className="ml-3"
                                onClick={handleDelete}>
                                <FontAwesomeIcon
                                  icon={faTrash}
                                  className="mr-2"
                                ></FontAwesomeIcon>{" "}
                                Eliminar
                              </Button>
                            </>
                          )
                          : (
                            <Button
                              activityid={activity.id}
                              variant="danger"
                              className="ml-3"
                              onClick={handleDelete}>
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="mr-2"
                              ></FontAwesomeIcon>{" "}
                              Eliminar
                            </Button>
                          )}
                      </div>
                    </Col>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
