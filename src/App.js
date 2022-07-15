import { useState, useEffect } from "react";
import { PersonForm } from "./components/PersonForm";
import { Person } from "./components/Person";
import { Filter } from "./components/Filter";
import { Notification } from "./components/Notification";
import personsService from "./services/persons";

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newFilter, setNewFilter] = useState("");
  const [notification, setNotification] = useState({
    message: null,
    style: "",
  });

  useEffect(() => {
    personsService.getAll().then((initialPersons) => {
      setPersons(initialPersons);
    });
  }, []);

  const modifyPhoneNumber = (person, newNumber) => {
    const changedPerson = { ...person, number: newNumber };
    personsService
      .update(person.id, changedPerson)
      .then((returnedPerson) => {
        setPersons(
          persons.map((p) => (p.id !== person.id ? p : returnedPerson))
        );
      })
      .then(() => {
        setNotification({ message: "Number changed", style: "info" });
      })
      .then(() => {
        setTimeout(() => {
          setNotification({ message: null });
        }, 5000);
      })
      .catch((error) => {
        setNotification({
          message: `Person '${person.name}' was already deleted from server`,
          style: "error",
        });
        setPersons(persons.filter((p) => p.id !== person.id));
      })
      .then(() => {
        setTimeout(() => {
          setNotification({ message: null });
        }, 5000);
      });
  };

  const addPerson = (event) => {
    event.preventDefault();
    if (newName.length === 0 || newNumber.length === 0) {
      setNotification({ message: "Name or number missing", style: "error" });
      return;
    }
    const existing = persons.filter((person) => person.name === newName);
    if (existing.length > 0) {
      if (window.confirm(`Replace ${newName} phone number?`)) {
        modifyPhoneNumber(existing[0], newNumber);
        return;
        // TODO: What happens when user presses cancel?
      }
    }
    const personObject = {
      name: newName,
      number: newNumber,
    };
    personsService
      .create(personObject)
      .then((returnedPerson) => {
        setPersons(persons.concat(returnedPerson));
        setNewName("");
        setNewNumber("");
        setNotification({ message: "New person added", style: "success" });
      })
      .then(() => {
        setTimeout(() => {
          setNotification({ message: null });
        }, 5000);
      });
  };

  const handleNameChange = (event) => {
    setNewName(event.target.value);
  };

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value);
  };

  const personsToShow =
    newFilter === ""
      ? persons
      : persons.filter((person) =>
          person.name.toLowerCase().includes(newFilter.toLowerCase())
        );

  const handleFilterChange = (event) => {
    setNewFilter(event.target.value);
  };

  const handleDeleteClick = ({ person }) => {
    if (window.confirm(`Delete ${person.name}`)) {
      personsService
        .deletePerson(person.id)
        .then((response) => {
          setPersons(persons.filter((p) => p.id !== person.id));
        })
        .then(() => {
          setNotification({
            message: "Person deleted",
            style: "info",
          });
        })
        .then(() => {
          setTimeout(() => {
            setNotification({ message: null });
          }, 5000);
        });
    }
  };

  return (
    <div>
      <h1>Phonebook</h1>
      <Notification message={notification.message} style={notification.style} />
      <Filter value={newFilter} onChange={handleFilterChange} />

      <h2>Add new person</h2>
      <PersonForm
        onSubmit={addPerson}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />

      <h2>Numbers</h2>
      {/* <Persons newFilter={newFilter} personsToShow={personsToShow} /> */}
      <p>
        {newFilter.length === 0 ? (
          <></>
        ) : personsToShow.length === 0 ? (
          <>No results</>
        ) : (
          <span>Filter in use</span>
        )}
      </p>
      <ul>
        {personsToShow.map((person) => (
          <li key={person.id}>
            <Person name={person.name} number={person.number} />{" "}
            <button onClick={() => handleDeleteClick({ person })}>
              delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
